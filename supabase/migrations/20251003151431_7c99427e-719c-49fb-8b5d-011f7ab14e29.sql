-- Drop the policy with wrong role
DROP POLICY IF EXISTS "Users can view their own bots" ON telegram_bots;

-- Create new SELECT policy with correct role (authenticated)
CREATE POLICY "Users can view their own bots" 
ON telegram_bots 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);