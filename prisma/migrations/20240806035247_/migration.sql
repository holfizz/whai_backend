/*
  Warnings:

  - You are about to drop the column `interaction_id` on the `choices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "choices" DROP COLUMN "interaction_id";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isHasSearchImageAI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHasVideo" BOOLEAN NOT NULL DEFAULT false;
