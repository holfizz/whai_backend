-- AlterTable
ALTER TABLE "messages_with_ai" ADD COLUMN     "courseAIHistoryId" TEXT;

-- CreateTable
CREATE TABLE "cousre_ai_history" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cousre_ai_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cousre_ai_history_id_key" ON "cousre_ai_history"("id");

-- AddForeignKey
ALTER TABLE "cousre_ai_history" ADD CONSTRAINT "cousre_ai_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_with_ai" ADD CONSTRAINT "messages_with_ai_courseAIHistoryId_fkey" FOREIGN KEY ("courseAIHistoryId") REFERENCES "cousre_ai_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
