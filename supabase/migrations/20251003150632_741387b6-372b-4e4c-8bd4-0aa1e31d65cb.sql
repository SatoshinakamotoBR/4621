-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own bots" ON telegram_bots;

-- Create new SELECT policy that allows users to see all columns of their own bots
CREATE POLICY "Users can view their own bots" 
ON telegram_bots 
FOR SELECT 
USING (auth.uid() = user_id);