#!/bin/bash

# URL Redirector Migration Script
# This script migrates from per-IP tracking to global first-click tracking

set -e  # Exit on any error

echo "🚀 Starting migration to global first-click redirect system..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Step 1: Add the firstUsed column to the database
echo "📊 Step 1: Adding firstUsed column to redirects table..."
psql "$DATABASE_URL" << 'EOF'
-- Add firstUsed field to redirects table
ALTER TABLE redirects ADD COLUMN IF NOT EXISTS first_used BOOLEAN DEFAULT false;

-- Update existing redirects to set firstUsed = true if they have any visits
-- This preserves the current behavior where redirects with visits should show the "next" URL
UPDATE redirects 
SET first_used = true 
WHERE id IN (
    SELECT DISTINCT slug_id 
    FROM redirect_visits
);

-- Show summary of changes
SELECT 
    COUNT(*) as total_redirects,
    SUM(CASE WHEN first_used = true THEN 1 ELSE 0 END) as redirects_marked_as_used,
    SUM(CASE WHEN first_used = false THEN 1 ELSE 0 END) as redirects_ready_for_first_click
FROM redirects;
EOF

echo "✅ Database migration completed successfully"
echo ""

# Step 2: Generate Prisma client with new schema
echo "🔧 Step 2: Regenerating Prisma client..."
npx prisma generate

echo "✅ Prisma client regenerated"
echo ""

# Step 3: Verify TypeScript compilation
echo "🔍 Step 3: Checking TypeScript compilation..."
npx tsc --noEmit

echo "✅ TypeScript compilation successful"
echo ""

# Step 4: Optional cleanup (commented out for safety)
echo "📝 Step 4: Cleanup options"
echo ""
echo "Your migration is complete! The redirect_visits table is still present but no longer used."
echo "After you've verified everything works correctly in production, you can optionally run:"
echo "psql \"\$DATABASE_URL\" -c \"DROP TABLE redirect_visits;\""
echo ""

echo "🎉 Migration completed successfully!"
echo ""
echo "Summary of changes:"
echo "- ✅ Added 'first_used' column to redirects table"
echo "- ✅ Existing redirects with visits marked as 'first_used = true'"
echo "- ✅ New redirects will start with 'first_used = false'"
echo "- ✅ Updated code now uses global first-click logic"
echo ""
echo "Behavior change:"
echo "- Before: Each IP address got the 'first' URL once"
echo "- After: Only the very first click ever (any IP) gets the 'first' URL"
echo ""
echo "You can now deploy this to production!" 