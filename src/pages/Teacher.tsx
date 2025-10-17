import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Trash2, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { SubmissionPDF } from "@/components/SubmissionPDF";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  student_name: string;
  game_title: string;
  protagonist_name: string;
  protagonist_traits: string;
  story_background: string;
  mood: string[];
  mood_custom: string | null;
  story_start: string;
  story_middle: string;
  choice_1: string;
  choice_2: string;
  happy_ending: string;
  sad_ending: string;
  created_at: string;
}

const Teacher = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();

    const channel = supabase
      .channel("submissions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        (payload) => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!submissionId) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      // DB에서 성공적으로 삭제된 후, 화면에서도 바로 제거합니다.
      setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId));

      toast({
        title: "삭제 완료",
        description: "기획서가 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("삭제 실패:", error);
      toast({
        title: "삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setSubmissionToDelete(null);
    }
  };

  const handleDownloadPDF = async (submission: Submission) => {
    try {
      const blob = await pdf(<SubmissionPDF submission={submission} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${submission.student_name}_${submission.game_title}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF 다운로드 완료",
        description: "기획서가 PDF로 저장되었습니다.",
      });
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast({
        title: "PDF 생성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              학생들의 기획서 제출 현황
            </h1>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            처음으로
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">로딩 중...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card className="rounded-3xl shadow-[var(--shadow-card)]">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                아직 제출된 기획서가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {submissions.map((submission) => (
              <AccordionItem value={submission.id} key={submission.id} className="border-none">
                <Card
                  className="rounded-3xl shadow-[var(--shadow-card)] overflow-hidden border-2 transition-colors data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="w-full p-0 hover:no-underline">
                    <CardHeader className="w-full text-left bg-gradient-to-r from-primary/10 to-secondary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold">
                            {submission.game_title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground pt-1">
                            작성자: {submission.student_name} ({formatDate(submission.created_at)})
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary/70 hover:text-primary hover:bg-primary/10 rounded-full h-10 w-10 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(submission);
                            }}
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full h-10 w-10 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubmissionToDelete(submission);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="p-6 pt-4 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-primary">🦸 주인공 이름</h3>
                        <p className="text-base pl-4">{submission.protagonist_name}</p>
                      </div>

                      {submission.protagonist_traits && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-primary">
                            ✨ 주인공의 특징이나 성격
                          </h3>
                          <p className="text-base pl-4 whitespace-pre-wrap">
                            {submission.protagonist_traits}
                          </p>
                        </div>
                      )}

                      {submission.story_background && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-primary">
                            🌍 이야기의 배경
                          </h3>
                          <p className="text-base pl-4 whitespace-pre-wrap">
                            {submission.story_background}
                          </p>
                        </div>
                      )}

                      {(submission.mood.length > 0 || submission.mood_custom) && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-primary">
                            🎭 어떤 분위기인가요?
                          </h3>
                          <div className="pl-4 flex flex-wrap gap-2">
                            {submission.mood.map((m, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-secondary/30 rounded-full text-sm"
                              >
                                {m}
                              </span>
                            ))}
                            {submission.mood_custom && (
                              <span className="px-3 py-1 bg-accent/30 rounded-full text-sm">
                                {submission.mood_custom}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-primary">📖 이야기의 흐름</h3>

                        {submission.story_start && (
                          <div className="space-y-2">
                            <h4 className="text-base font-bold">🌅 시작</h4>
                            <p className="text-base pl-4 whitespace-pre-wrap">
                              {submission.story_start}
                            </p>
                          </div>
                        )}

                        {submission.story_middle && (
                          <div className="space-y-2">
                            <h4 className="text-base font-bold">⚡ 중간 (주인공이 해야 할 일)</h4>
                            <p className="text-base pl-4 whitespace-pre-wrap">
                              {submission.story_middle}
                            </p>
                          </div>
                        )}

                        {(submission.choice_1 || submission.choice_2) && (
                          <div className="space-y-3">
                            <h4 className="text-base font-bold">🔀 선택의 순간</h4>
                            {submission.choice_1 && (
                              <div className="pl-4 space-y-1">
                                <p className="font-semibold text-sm">선택 1:</p>
                                <p className="text-base pl-3 whitespace-pre-wrap">
                                  {submission.choice_1}
                                </p>
                              </div>
                            )}
                            {submission.choice_2 && (
                              <div className="pl-4 space-y-1">
                                <p className="font-semibold text-sm">선택 2:</p>
                                <p className="text-base pl-3 whitespace-pre-wrap">
                                  {submission.choice_2}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {(submission.happy_ending || submission.sad_ending) && (
                          <div className="space-y-3">
                            <h4 className="text-base font-bold">🎬 끝</h4>
                            {submission.happy_ending && (
                              <div className="pl-4 space-y-1">
                                <p className="font-semibold text-sm">😊 해피 엔딩:</p>
                                <p className="text-base pl-3 whitespace-pre-wrap">
                                  {submission.happy_ending}
                                </p>
                              </div>
                            )}
                            {submission.sad_ending && (
                              <div className="pl-4 space-y-1">
                                <p className="font-semibold text-sm">😢 새드 엔딩:</p>
                                <p className="text-base pl-3 whitespace-pre-wrap">
                                  {submission.sad_ending}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
      <AlertDialog
        open={!!submissionToDelete}
        onOpenChange={(isOpen) => !isOpen && setSubmissionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{submissionToDelete?.student_name}" 학생의 "{submissionToDelete?.game_title}" 기획서를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(submissionToDelete?.id || "")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Teacher;
