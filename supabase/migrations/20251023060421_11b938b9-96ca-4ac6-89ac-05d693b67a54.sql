-- 게임 요소 필드 추가
ALTER TABLE submissions 
ADD COLUMN game_elements text[] NOT NULL DEFAULT '{}',
ADD COLUMN game_elements_custom text;