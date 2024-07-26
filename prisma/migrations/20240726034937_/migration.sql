/*
  Warnings:

  - You are about to drop the column `is_correct` on the `user_answers` table. All the data in the column will be lost.
  - Added the required column `correctAnswersDescription` to the `user_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct_answers` to the `user_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctnessPercentage` to the `user_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incorrectAnswersDescription` to the `user_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "quiz_results_id_key";

-- DropIndex
DROP INDEX "user_answers_id_key";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "name" SET DEFAULT 'Course';

-- AlterTable
ALTER TABLE "quiz_results" ALTER COLUMN "total_percents" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user_answers" DROP COLUMN "is_correct",
ADD COLUMN     "correctAnswersDescription" TEXT NOT NULL,
ADD COLUMN     "correct_answers" JSONB NOT NULL,
ADD COLUMN     "correctnessPercentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "incorrectAnswersDescription" TEXT NOT NULL;
