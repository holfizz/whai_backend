/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Folder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Lesson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LessonBlock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LessonTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `from` on the `MessageWithAI` table. All the data in the column will be lost.
  - The primary key for the `ProgressPercents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_progressPercentsId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_folderId_fkey";

-- DropForeignKey
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_quizId_fkey";

-- DropForeignKey
ALTER TABLE "LessonTask" DROP CONSTRAINT "LessonTask_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_courseId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "progressPercentsId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Course_id_seq";

-- AlterTable
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Folder_id_seq";

-- AlterTable
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "folderId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Lesson_id_seq";

-- AlterTable
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LessonBlock_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LessonBlock_id_seq";

-- AlterTable
ALTER TABLE "LessonTask" DROP CONSTRAINT "LessonTask_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LessonTask_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LessonTask_id_seq";

-- AlterTable
ALTER TABLE "MessageWithAI" DROP COLUMN "from",
ADD COLUMN     "role" "MessageWithAIRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "ProgressPercents" DROP CONSTRAINT "ProgressPercents_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProgressPercents_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProgressPercents_id_seq";

-- AlterTable
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Quiz_id_seq";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "courseId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTask" ADD CONSTRAINT "LessonTask_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_progressPercentsId_fkey" FOREIGN KEY ("progressPercentsId") REFERENCES "ProgressPercents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
