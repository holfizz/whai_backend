// import { PrismaService } from "@/prisma.service";
// import { Test, TestingModule } from "@nestjs/testing";
// import { CourseService } from "./course.service";
// import { CourseInput } from "./dto/course.input";
// import { UpdateCourse } from "./dto/update-course.input";
//
// describe("CourseService", () => {
//   let service: CourseService;
//   let prisma: PrismaService;
//   let course;
//
//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [CourseService, PrismaService],
//     }).compile();
//
//     service = module.get<CourseService>(CourseService);
//     prisma = module.get<PrismaService>(PrismaService);
//     course = await prisma.course.create({
//       data: {
//         name: "Test Course",
//         ownerID: "1",
//       },
//     });
//   });
//
//   afterAll(async () => {
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
//     it("should create a new course", async () => {
//       const newCourse: CourseInput = {
//         name: "New Test Course",
//       };
//       const createdCourse = await service.createCourse("1", newCourse);
//       expect(createdCourse).toBeDefined();
//       expect(createdCourse.id).toBeDefined();
//       expect(createdCourse.name).toEqual(newCourse.name);
//     });
//   });
//
//   describe("update", () => {
//     it("should update a course", async () => {
//       const updateCourse: UpdateCourse = {
//         id: course.id,
//         name: "Updated Test Course",
//       };
//       const updatedCourse = await service.updateCourse("1", updateCourse.id, updateCourse);
//       expect(updatedCourse).toBeDefined();
//       expect(updatedCourse.id).toEqual(course.id);
//       expect(updatedCourse.name).toEqual(updateCourse.name);
//     });
//   });
//
//   describe("delete", () => {
//     it("should delete a course", async () => {
//       const newCourse: CourseInput = {
//         name: "New Test Course to Delete",
//       };
//       const courseToDelete = await service.createCourse("1", newCourse);
//       await service.deleteCourse("1", courseToDelete.id);
//     });
//   });
// });
