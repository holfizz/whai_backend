/*
  Warnings:

  - The values [AUTHORIZED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('PENDING', 'AUTH_FAIL', 'REJECTED', 'CONFIRMED', 'THREE_DS_CHECKING');
ALTER TABLE "subscription_history" ALTER COLUMN "payment_status" TYPE "TransactionStatus_new" USING ("payment_status"::text::"TransactionStatus_new");
ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "months" SET DEFAULT 1;
