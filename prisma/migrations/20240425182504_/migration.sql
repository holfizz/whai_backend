-- DropForeignKey
ALTER TABLE "MessageWithAI" DROP CONSTRAINT "MessageWithAI_chat_with_ai_id_fkey";

-- AlterTable
ALTER TABLE "MessageWithAI" ALTER COLUMN "chat_with_ai_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MessageWithAI" ADD CONSTRAINT "MessageWithAI_chat_with_ai_id_fkey" FOREIGN KEY ("chat_with_ai_id") REFERENCES "ChatWithAI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
