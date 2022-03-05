/*
  Warnings:

  - You are about to alter the column `filter_type` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("users_filter_type")`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `filter_type` ENUM('MANUAL', 'SEMI_AUTO', 'AUTO') NOT NULL;
