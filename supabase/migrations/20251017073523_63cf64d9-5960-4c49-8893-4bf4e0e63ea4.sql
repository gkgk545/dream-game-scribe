-- Add DELETE policy for submissions table
CREATE POLICY "Anyone can delete submissions"
ON public.submissions
FOR DELETE
TO anon, authenticated
USING (true);