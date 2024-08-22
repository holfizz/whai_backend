/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `subscription_history` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_history_user_id_key" ON "subscription_history"("user_id");
