-- Update all users to have Kazakh language preference
UPDATE "Users"
SET "preferences" = jsonb_set("preferences", '{language}', '"kk"', true)
WHERE "preferences" IS NOT NULL AND "preferences" ? 'language' = false;

-- For users who already have a language preference set, update it to Kazakh
UPDATE "Users"
SET "preferences" = jsonb_set("preferences", '{language}', '"kk"')
WHERE "preferences" IS NOT NULL AND "preferences" ? 'language' = true; 