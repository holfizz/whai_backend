/*
  Warnings:

  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `subscriptions` table. All the data in the column will be lost.
  - The `current_subscription_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[current_subscription_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_current_subscription_id_fkey";

-- DropIndex
DROP INDEX "subscriptions_id_key";

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "current_subscription_id",
ADD COLUMN     "current_subscription_id" "SubscriptionType";

-- CreateIndex
CREATE UNIQUE INDEX "users_current_subscription_id_key" ON "users"("current_subscription_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_current_subscription_id_fkey" FOREIGN KEY ("current_subscription_id") REFERENCES "subscriptions"("type") ON DELETE SET NULL ON UPDATE CASCADE;
