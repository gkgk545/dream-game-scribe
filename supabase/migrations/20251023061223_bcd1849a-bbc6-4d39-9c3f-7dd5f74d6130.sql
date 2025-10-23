-- 투표 수 컬럼 추가
ALTER TABLE submissions 
ADD COLUMN vote_count integer NOT NULL DEFAULT 0;