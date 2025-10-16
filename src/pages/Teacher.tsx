import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();

    // 실시간 업데이트 설정
    const channel = supabase
      .channel("submissions-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
        },
        () => {
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
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="rounded-3xl shadow-[var(--shadow-card)] overflow-hidden border-2 hover:border-primary/50 transition-colors"
              >
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                      작성자: {submission.student_name}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">🎮 게임 제목</h3>
                    <p className="text-base pl-4">{submission.game_title}</p>
                  </div>

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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teacher;