-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_user_id_fkey";

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
