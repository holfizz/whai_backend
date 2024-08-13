/*
  Warnings:

  - You are about to drop the column `tasks` on the `lesson_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `lessonTaskId` on the `lessons` table. All the data in the column will be lost.
  - Added the required column `name` to the `lesson_tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_lessonTaskId_fkey";

-- DropIndex
DROP INDEX "lesson_tasks_lesson_id_key";

-- DropIndex
DROP INDEX "lessons_lessonTaskId_key";

-- AlterTable
ALTER TABLE "lesson_tasks" DROP COLUMN "tasks",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "lessonTaskId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_trial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "annual_discount_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "course_limit_per_month" INTEGER NOT NULL,
    "lesson_limit_per_course" INTEGER NOT NULL,
    "additional_titles_limit" INTEGER NOT NULL,
    "has_basic_analytics" BOOLEAN NOT NULL DEFAULT false,
    "has_ai_assisted_homework" BOOLEAN NOT NULL DEFAULT false,
    "has_file_upload_in_chat" BOOLEAN NOT NULL DEFAULT false,
    "has_image_generation" BOOLEAN NOT NULL DEFAULT false,
    "is_auto_renewal" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_id_key" ON "subscriptions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "lesson_tasks" ADD CONSTRAINT "lesson_tasks_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
