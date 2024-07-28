-- DropForeignKey
ALTER TABLE "QuizResult" DROP CONSTRAINT "QuizResult_courseId_fkey";

-- AlterTable
ALTER TABLE "QuizResult" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
