/*
  Warnings:

  - You are about to drop the column `user_id` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropIndex
DROP INDEX "subscriptions_user_id_key";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "current_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_type_key" ON "subscriptions"("type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_current_subscription_id_fkey" FOREIGN KEY ("current_subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
