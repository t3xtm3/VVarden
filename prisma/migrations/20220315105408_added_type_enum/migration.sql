/*
  Warnings:

  - You are about to alter the column `user_type` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("users_user_type")`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `user_type` ENUM('CHEATER', 'LEAKER', 'SUPPORTER', 'OWNER') NOT NULL;
