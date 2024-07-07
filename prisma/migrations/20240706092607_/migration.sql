/*
  Warnings:

  - You are about to drop the column `module_plan_id` on the `quiz_plans` table. All the data in the column will be lost.
  - You are about to drop the column `module_plan_id` on the `subtopic_plans` table. All the data in the column will be lost.
  - You are about to drop the `module_plans` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subtopic_id` to the `subtopic_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_plan_id` to the `subtopic_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "module_plans" DROP CONSTRAINT "module_plans_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_plans" DROP CONSTRAINT "quiz_plans_module_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "subtopic_plans" DROP CONSTRAINT "subtopic_plans_module_plan_id_fkey";

-- AlterTable
ALTER TABLE "quiz_plans" DROP COLUMN "module_plan_id",
ADD COLUMN     "topic_plan_id" TEXT;

-- AlterTable
ALTER TABLE "subtopic_plans" DROP COLUMN "module_plan_id",
ADD COLUMN     "subtopic_id" TEXT NOT NULL,
ADD COLUMN     "topic_plan_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "module_plans";

-- CreateTable
CREATE TABLE "topic_plans" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "plan_id" TEXT,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "topic_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "topic_plans" ADD CONSTRAINT "topic_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_plans" ADD CONSTRAINT "topic_plans_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopic_plans" ADD CONSTRAINT "subtopic_plans_topic_plan_id_fkey" FOREIGN KEY ("topic_plan_id") REFERENCES "topic_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopic_plans" ADD CONSTRAINT "subtopic_plans_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_plans" ADD CONSTRAINT "quiz_plans_topic_plan_id_fkey" FOREIGN KEY ("topic_plan_id") REFERENCES "topic_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
