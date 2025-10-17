import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const Student = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const studentName = location.state?.studentName || "학생";

  const [existingSubmissionId, setExistingSubmissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gameTitle: "",
    protagonistName: "",
    protagonistTraits: "",
    storyBackground: "",
    mood: [] as string[],
    moodCustom: "",
    storyStart: "",
    storyMiddle: "",
    choice1: "",
    choice2: "",
    happyEnding: "",
    sadEnding: "",
  });

  useEffect(() => {
    const loadExistingSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("student_name", studentName)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setExistingSubmissionId(data.id);
          setFormData({
            gameTitle: data.game_title || "",
            protagonistName: data.protagonist_name || "",
            protagonistTraits: data.protagonist_traits || "",
            storyBackground: data.story_background || "",
            mood: data.mood || [],
            moodCustom: data.mood_custom || "",
            storyStart: data.story_start || "",
            storyMiddle: data.story_middle || "",
            choice1: data.choice_1 || "",
            choice2: data.choice_2 || "",
            happyEnding: data.happy_ending || "",
            sadEnding: data.sad_ending || "",
          });

          toast({
            title: "이전 작성 내용을 불러왔습니다",
            description: "수정하고 다시 제출할 수 있습니다.",
          });
        }
      } catch (error) {
        console.error("기존 제출물 불러오기 실패:", error);
      }
    };

    loadExistingSubmission();
  }, [studentName, toast]);

  const moodOptions = [
    "신나는 모험",
    "으스스한 공포",
    "알쏭달쏭 수수께끼",
    "웃기는 코미디",
  ];

  const handleMoodChange = (mood: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      mood: checked
        ? [...prev.mood, mood]
        : prev.mood.filter((m) => m !== mood),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 항목 검증
    if (!formData.gameTitle || !formData.protagonistName || !formData.storyStart) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "게임 제목, 주인공 이름, 시작 부분은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const submissionData = {
        student_name: studentName,
        game_title: formData.gameTitle,
        protagonist_name: formData.protagonistName,
        protagonist_traits: formData.protagonistTraits,
        story_background: formData.storyBackground,
        mood: formData.mood,
        mood_custom: formData.moodCustom,
        story_start: formData.storyStart,
        story_middle: formData.storyMiddle,
        choice_1: formData.choice1,
        choice_2: formData.choice2,
        happy_ending: formData.happyEnding,
        sad_ending: formData.sadEnding,
      };

      let error;

      if (existingSubmissionId) {
        // 기존 제출물이 있으면 업데이트
        ({ error } = await supabase
          .from("submissions")
          .update(submissionData)
          .eq("id", existingSubmissionId));
      } else {
        // 새로운 제출
        ({ error } = await supabase.from("submissions").insert(submissionData));
      }

      if (error) throw error;

      toast({
        title: existingSubmissionId ? "🎉 수정 완료!" : "🎉 제출 완료!",
        description: existingSubmissionId
          ? "기획서가 성공적으로 수정되었습니다!"
          : "기획서가 성공적으로 제출되었습니다!",
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("제출 실패:", error);
      toast({
        title: "제출 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <Sparkles className="w-8 h-8 text-primary" />
              {studentName} 학생, 나만의 이야기를 상상해봐요!
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gameTitle" className="text-lg font-semibold">
                게임 제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gameTitle"
                value={formData.gameTitle}
                onChange={(e) =>
                  setFormData({ ...formData, gameTitle: e.target.value })
                }
                placeholder="예) 마법의 숲 대모험"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protagonistName" className="text-lg font-semibold">
                주인공 이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="protagonistName"
                value={formData.protagonistName}
                onChange={(e) =>
                  setFormData({ ...formData, protagonistName: e.target.value })
                }
                placeholder="예) 용감한 민수"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protagonistTraits" className="text-lg font-semibold">
                주인공의 특징이나 성격
              </Label>
              <Textarea
                id="protagonistTraits"
                value={formData.protagonistTraits}
                onChange={(e) =>
                  setFormData({ ...formData, protagonistTraits: e.target.value })
                }
                placeholder="예) 친구들을 잘 도와주고, 어려운 문제도 포기하지 않아요."
                className="min-h-24 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storyBackground" className="text-lg font-semibold">
                이야기의 배경
              </Label>
              <Textarea
                id="storyBackground"
                value={formData.storyBackground}
                onChange={(e) =>
                  setFormData({ ...formData, storyBackground: e.target.value })
                }
                placeholder="예) 신비한 마법이 살아있는 숲속 마을"
                className="min-h-24 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">어떤 분위기인가요?</Label>
              <div className="space-y-3">
                {moodOptions.map((mood) => (
                  <div key={mood} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                    <Checkbox
                      id={mood}
                      checked={formData.mood.includes(mood)}
                      onCheckedChange={(checked) =>
                        handleMoodChange(mood, checked as boolean)
                      }
                    />
                    <Label htmlFor={mood} className="cursor-pointer flex-1">
                      {mood}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-muted/50">
                  <Checkbox
                    id="custom"
                    checked={formData.moodCustom !== ""}
                    onCheckedChange={(checked) => {
                      if (!checked) setFormData({ ...formData, moodCustom: "" });
                    }}
                  />
                  <Label htmlFor="custom" className="cursor-pointer">
                    직접 쓰기:
                  </Label>
                  <Input
                    value={formData.moodCustom}
                    onChange={(e) =>
                      setFormData({ ...formData, moodCustom: e.target.value })
                    }
                    placeholder="직접 입력"
                    className="flex-1 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-primary">📖 이야기의 흐름</h3>
              
              <div className="space-y-2">
                <Label htmlFor="storyStart" className="text-lg font-semibold">
                  시작 (어떤 사건으로 이야기가 시작되나요?) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="storyStart"
                  value={formData.storyStart}
                  onChange={(e) =>
                    setFormData({ ...formData, storyStart: e.target.value })
                  }
                  placeholder="예) 어느 날 주인공이 숲에서 빛나는 보물 상자를 발견했어요."
                  className="min-h-32 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storyMiddle" className="text-lg font-semibold">
                  중간 (주인공은 무엇을 해야 하나요?)
                </Label>
                <Textarea
                  id="storyMiddle"
                  value={formData.storyMiddle}
                  onChange={(e) =>
                    setFormData({ ...formData, storyMiddle: e.target.value })
                  }
                  placeholder="예) 보물 상자를 열기 위해 세 가지 시련을 통과해야 해요."
                  className="min-h-32 rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  중간 (주인공 앞에 어떤 선택의 순간이 나타나나요?)
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="choice1" className="font-medium">선택 1</Label>
                    <Textarea
                      id="choice1"
                      value={formData.choice1}
                      onChange={(e) =>
                        setFormData({ ...formData, choice1: e.target.value })
                      }
                      placeholder="예) 위험하지만 빠른 길로 간다"
                      className="min-h-24 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="choice2" className="font-medium">선택 2</Label>
                    <Textarea
                      id="choice2"
                      value={formData.choice2}
                      onChange={(e) =>
                        setFormData({ ...formData, choice2: e.target.value })
                      }
                      placeholder="예) 안전하지만 시간이 오래 걸리는 길로 간다"
                      className="min-h-24 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  끝 (이야기는 어떻게 끝나나요?)
                </Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="happyEnding" className="font-medium">해피 엔딩</Label>
                    <Textarea
                      id="happyEnding"
                      value={formData.happyEnding}
                      onChange={(e) =>
                        setFormData({ ...formData, happyEnding: e.target.value })
                      }
                      placeholder="예) 주인공이 보물을 찾고 모두가 행복해졌어요!"
                      className="min-h-24 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sadEnding" className="font-medium">새드 엔딩</Label>
                    <Textarea
                      id="sadEnding"
                      value={formData.sadEnding}
                      onChange={(e) =>
                        setFormData({ ...formData, sadEnding: e.target.value })
                      }
                      placeholder="예) 보물은 찾았지만 친구를 잃고 슬퍼했어요."
                      className="min-h-24 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              {existingSubmissionId ? "✏️ 수정하기" : "✨ 제출하기"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Student;
