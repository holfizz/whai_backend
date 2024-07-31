/*
  Warnings:

  - You are about to drop the `interactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "choices" DROP CONSTRAINT "choices_interaction_id_fkey";

-- DropForeignKey
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_question_id_fkey";

-- DropTable
DROP TABLE "interactions";
