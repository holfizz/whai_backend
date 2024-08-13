-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subscription_type" "SubscriptionType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_history_id_key" ON "subscription_history"("id");

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
