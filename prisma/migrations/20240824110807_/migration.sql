/*
  Warnings:

  - You are about to drop the column `order` on the `transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "transaction_order_key";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "order",
ADD COLUMN     "order_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transaction_order_id_key" ON "transaction"("order_id");
