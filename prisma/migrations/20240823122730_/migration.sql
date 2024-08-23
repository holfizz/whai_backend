/*
  Warnings:

  - The values [AUTH_FAIL,THREE_DS_CHECKING] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('PENDING', 'REJECTED', 'CONFIRMED', 'REVERSED', 'REFUNDED');
ALTER TABLE "transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
