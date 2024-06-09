-- CreateTable
CREATE TABLE "QuizPlan" (
    "id" TEXT NOT NULL,
    "subtopic_plan_id" TEXT,
    "module_plan_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" "IconType" NOT NULL DEFAULT 'QUIZ',

    CONSTRAINT "QuizPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizPlan" ADD CONSTRAINT "QuizPlan_subtopic_plan_id_fkey" FOREIGN KEY ("subtopic_plan_id") REFERENCES "SubtopicPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizPlan" ADD CONSTRAINT "QuizPlan_module_plan_id_fkey" FOREIGN KEY ("module_plan_id") REFERENCES "ModulePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
