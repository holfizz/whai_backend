/*
  Warnings:

  - You are about to drop the column `name` on the `lesson_tasks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lesson_id]` on the table `lesson_tasks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lessonTaskId]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonTaskId` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lesson_tasks" DROP CONSTRAINT "lesson_tasks_lesson_id_fkey";

-- AlterTable
ALTER TABLE "lesson_tasks" DROP COLUMN "name",
ADD COLUMN     "tasks" TEXT[];

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "lessonTaskId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "lesson_tasks_lesson_id_key" ON "lesson_tasks"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_lessonTaskId_key" ON "lessons"("lessonTaskId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_lessonTaskId_fkey" FOREIGN KEY ("lessonTaskId") REFERENCES "lesson_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
