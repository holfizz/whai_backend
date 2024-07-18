/*
  Warnings:

  - Made the column `user_id` on table `chats_with_ai` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "chats_with_ai" DROP CONSTRAINT "chats_with_ai_user_id_fkey";

-- AlterTable
ALTER TABLE "chats_with_ai" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "chats_with_ai" ADD CONSTRAINT "chats_with_ai_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
