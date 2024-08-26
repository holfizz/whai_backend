-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_subtopic_id_fkey";

-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "subtopic_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
