import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gamepad2 } from "lucide-react";

const Login = () => {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === "student") {
      if (!studentName.trim()) {
        alert("이름을 입력해주세요!");
        return;
      }
      navigate("/student", { state: { studentName } });
    } else {
      navigate("/teacher");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-[2rem] shadow-[var(--shadow-card)] p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-2">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎮 나만의 스토리 게임 기획
            </h1>
            <p className="text-muted-foreground">
              상상력을 펼쳐보세요!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">나는...</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "student" | "teacher")}>
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer flex-1 text-base">
                    학생
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="cursor-pointer flex-1 text-base">
                    교사
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {role === "student" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="name" className="text-base font-semibold">
                  이름
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="h-12 text-base rounded-xl"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              입장하기
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
