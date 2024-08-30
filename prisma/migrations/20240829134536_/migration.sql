/*
  Warnings:

  - You are about to drop the column `current_subscription_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[current_subscription_type]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_current_subscription_id_fkey";

-- DropIndex
DROP INDEX "users_current_subscription_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "current_subscription_id",
ADD COLUMN     "current_subscription_type" "SubscriptionType";

-- CreateIndex
CREATE UNIQUE INDEX "users_current_subscription_type_key" ON "users"("current_subscription_type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_current_subscription_type_fkey" FOREIGN KEY ("current_subscription_type") REFERENCES "subscriptions"("type") ON DELETE SET NULL ON UPDATE CASCADE;
