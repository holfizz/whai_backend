-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('AUTH_FAIL', 'REJECTED', 'CONFIRMED', 'AUTHORIZED', 'THREE_DS_CHECKING');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "amountValue" TEXT NOT NULL,
    "amountCurrency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
