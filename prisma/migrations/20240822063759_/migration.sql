/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_auto_renewal" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payment_id" TEXT NOT NULL,
    "payment_method" TEXT,
    "months" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_payment_id_key" ON "transaction"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_user_id_key" ON "transaction"("user_id");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
