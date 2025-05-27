-- Add firstUsed field to redirects table
-- This script is safe to run on production - it only adds a new column with a default value

ALTER TABLE redirects ADD COLUMN IF NOT EXISTS first_used BOOLEAN DEFAULT false;

-- Update existing redirects to set firstUsed = true if they have any visits
-- This preserves the current behavior where redirects with visits should show the "next" URL
UPDATE redirects 
SET first_used = true 
WHERE id IN (
    SELECT DISTINCT slug_id 
    FROM redirect_visits
);

-- Note: After running this script, you can safely drop the redirect_visits table
-- once you've deployed the new code, since the new logic doesn't use it
-- DROP TABLE redirect_visits; 