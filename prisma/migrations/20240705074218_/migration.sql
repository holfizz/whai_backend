-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subtopics" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;
