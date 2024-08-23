/*
  Warnings:

  - The `payment_id` column on the `transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "transaction_payment_id_key";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "payment_id",
ADD COLUMN     "payment_id" BIGINT;
