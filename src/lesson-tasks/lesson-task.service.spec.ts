// import { PrismaService } from "@/prisma.service";
// import { Test, TestingModule } from "@nestjs/testing";
// import { LessonTasksInput } from "./dto/lesson-task.input";
// import { LessonTasksService } from "./lesson-tasks.service";
//
// describe("LessonTasksService", () => {
//   let service: LessonTasksService;
//   let prisma: PrismaService;
//   let lesson;
//   let folder;
//   let course;
//
//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [LessonTasksService, PrismaService],
//     }).compile();
//
//     service = module.get<LessonTasksService>(LessonTasksService);
//     prisma = module.get<PrismaService>(PrismaService);
//     course = await prisma.course.create({
//       data: {
//         name: "Test course",
//         ownerID: "1",
//       },
//     });
//     folder = await prisma.folder.create({
//       data: {
//         name: "Test folder",
//         courseId: course.id,
//       },
//     });
//     lesson = await prisma.lesson.create({
//       data: {
//         name: "Test lesson",
//         folderId: folder.id,
//         types: ["QUIZ", "VIDEO"],
//       },
//     });
//   });
//
//   afterAll(async () => {
//     await prisma.lessonTask.deleteMany({
//       where: { lessonId: lesson.id },
//     });
//     await prisma.lesson.delete({
//       where: { id: lesson.id },
//     });
//
//     await prisma.folder.delete({
//       where: { id: folder.id },
//     });
//
//     await prisma.course.delete({
//       where: { id: course.id },
//     });
//   });
//
//   it("should be defined", () => {
//     expect(service).toBeDefined();
//   });
//
//   describe("create", () => {
//     it("should create a new lesson task", async () => {
//       const newLessonTask: LessonTasksInput = {
//         lessonId: lesson.id,
//         name: "Test Task",
//         isChecked: false,
//       };
//       const lessonTask = await service.createLessonTask(newLessonTask);
//       expect(lessonTask).toBeDefined();
//       expect(lessonTask.id).toBeDefined();
//       expect(lessonTask.name).toEqual(newLessonTask.name);
//       expect(lessonTask.lessonId).toEqual(newLessonTask.lessonId);
//       expect(lessonTask.isChecked).toEqual(newLessonTask.isChecked);
//     });
//   });
//   describe("update", () => {
//     it("should update a lesson task", async () => {
//       const newLessonTask: LessonTasksInput = {
//         lessonId: lesson.id,
//         name: "Test Task",
//         isChecked: false,
//       };
//       const lessonTask = await service.createLessonTask(newLessonTask);
//       const updatedLessonTask = await service.updateLessonTask(lessonTask.id, { name: "Updated Test Task", isChecked: true });
//       expect(updatedLessonTask).toBeDefined();
//       expect(updatedLessonTask.id).toEqual(lessonTask.id);
//       expect(updatedLessonTask.name).toEqual("Updated Test Task");
//       expect(updatedLessonTask.isChecked).toEqual(true);
//     });
//   });
//
//   describe("delete", () => {
//     it("should delete a lesson task", async () => {
//       const newLessonTask: LessonTasksInput = {
//         lessonId: lesson.id,
//         name: "Test Task",
//         isChecked: false,
//       };
//       const lessonTask = await service.createLessonTask(newLessonTask);
//       await service.deleteLessonTask(lessonTask.id);
//       await expect(service.deleteLessonTask(lessonTask.id)).rejects.toThrow();
//     });
//
//     it("should throw an error if lesson task does not exist", async () => {
//       await expect(service.deleteLessonTask("non-existing-id")).rejects.toThrow();
//     });
//   });
// });
