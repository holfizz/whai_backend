import { PrismaService } from "@/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { LessonBlockEnum } from "@prisma/client";
import { LessonBlockInput } from "./dto/lesson-block.input";
import { LessonBlockService } from "./lesson-block.service";

describe("LessonBlockService", () => {
  let service: LessonBlockService;
  let prisma: PrismaService;
  let lesson;
  let folder;
  let course;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonBlockService, PrismaService],
    }).compile();

    service = module.get<LessonBlockService>(LessonBlockService);
    prisma = module.get<PrismaService>(PrismaService);
    course = await prisma.course.create({
      data: {
        name: "Test course",
        ownerID: "1",
      },
    });
    folder = await prisma.folder.create({
      data: {
        name: "Test folder",
        courseId: course.id,
      },
    });
    lesson = await prisma.lesson.create({
      data: {
        name: "Test lesson",
        folderId: folder.id,
        types: ["QUIZ", "VIDEO"],
      },
    });
  });

  afterAll(async () => {
    await prisma.lessonBlock.deleteMany({
      where: { lessonId: lesson.id },
    });
    await prisma.lesson.delete({
      where: { id: lesson.id },
    });

    await prisma.folder.delete({
      where: { id: folder.id },
    });

    await prisma.course.delete({
      where: { id: course.id },
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new lesson block", async () => {
      const newLessonBlock: LessonBlockInput = {
        lessonId: lesson.id,
        type: LessonBlockEnum.CODE,
      };
      const lessonBlock = await service.createLessonBlock(newLessonBlock);
      expect(lessonBlock).toBeDefined();
      expect(lessonBlock.id).toBeDefined();
      expect(lessonBlock.type).toEqual(newLessonBlock.type);
      expect(lessonBlock.lessonId).toEqual(newLessonBlock.lessonId);
    });
  });

  describe("update", () => {
    it("should update a lesson block", async () => {
      const newLessonBlock: LessonBlockInput = {
        lessonId: lesson.id,
        type: LessonBlockEnum.CODE,
        // add other required fields
      };
      const lessonBlock = await service.createLessonBlock(newLessonBlock);
      const updatedLessonBlock = await service.updateLessonBlock(lessonBlock.id, { type: LessonBlockEnum.VIDEO });
      expect(updatedLessonBlock).toBeDefined();
      expect(updatedLessonBlock.id).toEqual(lessonBlock.id);
      expect(updatedLessonBlock.type).toEqual(LessonBlockEnum.VIDEO);
    });
  });

  describe("delete", () => {
    it("should delete a lesson block", async () => {
      const newLessonBlock: LessonBlockInput = {
        lessonId: lesson.id,
        type: LessonBlockEnum.CODE,
        // add other required fields
      };
      const lessonBlock = await service.createLessonBlock(newLessonBlock);
      await service.deleteLessonBlock(lessonBlock.id);
      await expect(service.deleteLessonBlock(lessonBlock.id)).rejects.toThrowError();
    });

    it("should throw an error if lesson block does not exist", async () => {
      await expect(service.deleteLessonBlock("non-existing-id")).rejects.toThrowError();
    });
  });
});
