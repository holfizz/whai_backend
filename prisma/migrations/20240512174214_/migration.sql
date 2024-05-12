-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "sendToTelegram" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderId" TEXT;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
