/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transaction_order_key" ON "transaction"("order");
