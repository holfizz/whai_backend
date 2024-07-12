/*
  Warnings:

  - Changed the type of `selected_answer` on the `user_answers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_answers" DROP COLUMN "selected_answer",
ADD COLUMN     "selected_answer" JSONB NOT NULL;
