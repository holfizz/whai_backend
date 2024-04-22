/*
  Warnings:

  - You are about to drop the column `conte` on the `MessageWithAI` table. All the data in the column will be lost.
  - Added the required column `content` to the `MessageWithAI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageWithAI" DROP COLUMN "conte",
ADD COLUMN     "content" TEXT NOT NULL;
