-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chat_id_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "chat_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
