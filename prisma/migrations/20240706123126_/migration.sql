-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "planId" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
