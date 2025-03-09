-- Delete all user-specific achievements
DELETE FROM "Achievements" WHERE "userId" IS NOT NULL;

-- Update template achievements to include translationKeys (if needed)
UPDATE "Achievements" 
SET "translationKey" = 'financial.first_note' 
WHERE "requirements"->>'type' = 'EXPENSE_COUNT' AND ("requirements"->>'count')::integer = 1 AND "userId" IS NULL;

UPDATE "Achievements" 
SET "translationKey" = 'financial.finance_way_started' 
WHERE "requirements"->>'type' = 'EXPENSE_STREAK' AND ("requirements"->>'days')::integer = 7 AND "userId" IS NULL;

UPDATE "Achievements" 
SET "translationKey" = 'financial.responsible' 
WHERE "requirements"->>'type' = 'EXPENSE_STREAK' AND ("requirements"->>'days')::integer = 30 AND "userId" IS NULL;

UPDATE "Achievements" 
SET "translationKey" = 'time.first_task' 
WHERE "requirements"->>'type' = 'TASK_COMPLETED' AND ("requirements"->>'count')::integer = 1 AND "userId" IS NULL;

UPDATE "Achievements" 
SET "translationKey" = 'time.month_without_miss' 
WHERE "requirements"->>'type' = 'TASK_STREAK' AND ("requirements"->>'days')::integer = 30 AND "userId" IS NULL;

UPDATE "Achievements" 
SET "translationKey" = 'time.deadline_met' 
WHERE "requirements"->>'type' = 'DEADLINE_MET' AND "userId" IS NULL; 