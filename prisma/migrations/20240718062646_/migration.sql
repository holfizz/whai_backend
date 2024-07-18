/*
  Warnings:

  - A unique constraint covering the columns `[course_id]` on the table `cousre_ai_history` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cousre_ai_history_course_id_key" ON "cousre_ai_history"("course_id");
