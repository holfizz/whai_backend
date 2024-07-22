/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `chat_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `choices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `interactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `learning_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `lesson_blocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `lesson_tasks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `matching_interactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `messages_with_ai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `notices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `quiz_results` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `subtopics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `telegram_links` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `topics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `user_answers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analytics_id_key" ON "analytics"("id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_course_id_key" ON "analytics"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_userId_key" ON "analytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_members_id_key" ON "chat_members"("id");

-- CreateIndex
CREATE UNIQUE INDEX "chats_id_key" ON "chats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "choices_id_key" ON "choices"("id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_id_key" ON "courses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "interactions_id_key" ON "interactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_sessions_id_key" ON "learning_sessions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_blocks_id_key" ON "lesson_blocks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_tasks_id_key" ON "lesson_tasks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_id_key" ON "lessons"("id");

-- CreateIndex
CREATE UNIQUE INDEX "matching_interactions_id_key" ON "matching_interactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_id_key" ON "messages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_with_ai_id_key" ON "messages_with_ai"("id");

-- CreateIndex
CREATE UNIQUE INDEX "notices_id_key" ON "notices"("id");

-- CreateIndex
CREATE UNIQUE INDEX "questions_id_key" ON "questions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_results_id_key" ON "quiz_results"("id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_id_key" ON "quizzes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subtopics_id_key" ON "subtopics"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_links_id_key" ON "telegram_links"("id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_id_key" ON "topics"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_id_key" ON "user_answers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
