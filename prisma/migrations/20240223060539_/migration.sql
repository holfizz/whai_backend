/*
  Warnings:

  - Made the column `chat_with_ai_id` on table `MessageWIthAI` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MessageWIthAI" DROP CONSTRAINT "MessageWIthAI_chat_with_ai_id_fkey";

-- AlterTable
ALTER TABLE "MessageWIthAI" ALTER COLUMN "file" DROP NOT NULL,
ALTER COLUMN "chat_with_ai_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MessageWIthAI" ADD CONSTRAINT "MessageWIthAI_chat_with_ai_id_fkey" FOREIGN KEY ("chat_with_ai_id") REFERENCES "ChatWithAI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
