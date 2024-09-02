-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('START', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "interaction_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT,
    "file_url" TEXT NOT NULL,
    "title" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'START',
    "message" TEXT,
    "responseId" TEXT NOT NULL,

    CONSTRAINT "interaction_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "interactionHistoryId" TEXT NOT NULL,
    "status" "ResponseStatus" NOT NULL,
    "reason" TEXT,
    "links" TEXT[],
    "incorrectParts" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "completionPercentage" INTEGER NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interaction_history_id_key" ON "interaction_history"("id");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_history_responseId_key" ON "interaction_history"("responseId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_id_key" ON "Response"("id");

-- AddForeignKey
ALTER TABLE "interaction_history" ADD CONSTRAINT "interaction_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_history" ADD CONSTRAINT "interaction_history_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lesson_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_history" ADD CONSTRAINT "interaction_history_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
