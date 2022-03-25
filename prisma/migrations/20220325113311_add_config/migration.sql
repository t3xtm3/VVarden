-- AlterTable
ALTER TABLE `guild` ADD COLUMN `appealunban` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` MODIFY `user_type` ENUM('CHEATER', 'LEAKER', 'SUPPORTER', 'OTHER', 'OWNER', 'BOT') NOT NULL;
