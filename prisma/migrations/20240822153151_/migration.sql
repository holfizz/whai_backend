/*
  Warnings:

  - The `rebill_id` column on the `transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "rebill_id",
ADD COLUMN     "rebill_id" INTEGER;
