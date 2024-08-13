/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_userId_key" ON "quizzes"("userId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
