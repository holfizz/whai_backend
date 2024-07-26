/*
  Warnings:

  - You are about to alter the column `total_percents` on the `quiz_results` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `correctAnswersDescription` on the `user_answers` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answers` on the `user_answers` table. All the data in the column will be lost.
  - You are about to drop the column `correctnessPercentage` on the `user_answers` table. All the data in the column will be lost.
  - You are about to drop the column `incorrectAnswersDescription` on the `user_answers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `quiz_results` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `user_answers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `is_correct` to the `user_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_results" ALTER COLUMN "total_percents" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "user_answers" DROP COLUMN "correctAnswersDescription",
DROP COLUMN "correct_answers",
DROP COLUMN "correctnessPercentage",
DROP COLUMN "incorrectAnswersDescription",
ADD COLUMN     "is_correct" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "quiz_results_id_key" ON "quiz_results"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_id_key" ON "user_answers"("id");
