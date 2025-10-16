-- 스토리 게임 기획서 제출 테이블 생성
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  game_title TEXT NOT NULL,
  protagonist_name TEXT NOT NULL,
  protagonist_traits TEXT NOT NULL,
  story_background TEXT NOT NULL,
  mood TEXT[] NOT NULL DEFAULT '{}',
  mood_custom TEXT,
  story_start TEXT NOT NULL,
  story_middle TEXT NOT NULL,
  choice_1 TEXT NOT NULL,
  choice_2 TEXT NOT NULL,
  happy_ending TEXT NOT NULL,
  sad_ending TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 제출할 수 있도록 허용
CREATE POLICY "Anyone can insert submissions"
ON public.submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 모든 사용자가 제출된 기획서를 볼 수 있도록 허용
CREATE POLICY "Anyone can view submissions"
ON public.submissions
FOR SELECT
TO anon, authenticated
USING (true);

-- 익명 사용자가 기획서를 삭제할 수 있도록 허용 정책 수정
CREATE POLICY "Anonymous users can delete submissions"
ON public.submissions
FOR DELETE
TO anon
USING (true);

-- 실시간 업데이트를 위한 설정
ALTER TABLE public.submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
