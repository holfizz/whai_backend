// import { PrismaService } from "@/prisma.service";
// import { Test, TestingModule } from "@nestjs/testing";
// import { SubtopicInput } from "./dto/create-subtopic.input";
// import { UpdateSubtopicInput } from "./dto/update-subtopic.input";
// import { SubtopicService } from "./subtopic.service";
//
// describe("FolderService", () => {
//   let service: SubtopicService;
//   let prisma: PrismaService;
//   let course;
//
//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [SubtopicService, PrismaService],
//     }).compile();
//
//     service = module.get<SubtopicService>(SubtopicService);
//     prisma = module.get<PrismaService>(PrismaService);
//     course = await prisma.course.create({
//       data: {
//         name: "Test course",
//         ownerID: "1",
//       },
//     });
//   });
//
//   afterAll(async () => {
//     await prisma.folder.deleteMany({
//       where: { courseId: course.id },
//     });
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
//     it("should create a new folder", async () => {
//       const newFolder: SubtopicInput = {
//         name: "New Test Folder",
//         courseId: course.id,
//       };
//       const createdFolder = await service.createFolder(newFolder);
//       expect(createdFolder).toBeDefined();
//       expect(createdFolder.id).toBeDefined();
//       expect(createdFolder.name).toEqual(newFolder.name);
//       expect(createdFolder.courseId).toEqual(newFolder.courseId);
//     });
//   });
//
//   describe("update", () => {
//     it("should update a folder", async () => {
//       const newFolder: SubtopicInput = {
//         name: "New Test Folder",
//         courseId: course.id,
//       };
//       const createdFolder = await service.createFolder(newFolder);
//       const updateFolder: UpdateSubtopicInput = {
//         name: "Updated Test Folder",
//         description: "Description",
//       };
//       const updatedFolder = await service.updateFolder(createdFolder.id, updateFolder);
//       expect(updatedFolder).toBeDefined();
//       expect(updatedFolder.description).toEqual("Description");
//       expect(updatedFolder.name).toEqual(updateFolder.name);
//     });
//   });
//
//   describe("delete", () => {
//     it("should delete a folder", async () => {
//       const newFolder: SubtopicInput = {
//         name: "New Test Folder to Delete",
//         courseId: course.id,
//       };
//       const folderToDelete = await service.createFolder(newFolder);
//       await service.deleteFolder(folderToDelete.id);
//     });
//   });
// });
