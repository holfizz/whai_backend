// import { EduAiService } from "@/edu-ai/edu-ai.service";
// import { PrismaService } from "@/prisma.service";
// import { HttpModule } from "@nestjs/axios";
// import { Test, TestingModule } from "@nestjs/testing";
// import { QuizInput, SaveQuizResultInput } from "./dto/quiz.input";
// import { QuizRepository } from "./quiz.repository";
// import { QuizService } from "./quiz.service";
// import { QuizUtils } from "./quiz.utils";

// describe("QuizService with lesson, lessonBlock, and folder", () => {
//   let service: QuizService;
//   let prisma: PrismaService;

//   let course;
//   let folder;
//   let lesson;
//   let lessonBlock;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [HttpModule], // Импортируем HttpModule
//       providers: [QuizService, PrismaService, EduAiService, QuizRepository, QuizUtils],
//     }).compile();

//     service = module.get<QuizService>(QuizService);
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
//       },
//     });

//     lessonBlock = await prisma.lessonBlock.create({
//       data: {
//         lessonId: lesson.id,
//         type: "QUIZ",
//       },
//     });
//   });

//   afterAll(async () => {
//     await prisma.choice.deleteMany({
//       where: {
//         question: {
//           quiz: {
//             lessonBlockId: lessonBlock.id,
//           },
//         },
//       },
//     });

//     await prisma.quiz.deleteMany({
//       where: {
//         lessonBlockId: lessonBlock.id,
//       },
//     });

//     await prisma.lessonBlock.deleteMany({
//       where: { lessonId: lesson.id },
//     });
//     await prisma.lesson.deleteMany({
//       where: { folderId: folder.id },
//     });
//     await prisma.folder.deleteMany({
//       where: { courseId: course.id },
//     });
//     await prisma.course.deleteMany({
//       where: { id: course.id },
//     });
//   });

//   it("should create a quiz and link it to a lessonBlock within a lesson and folder", async () => {
//     const quizInput: QuizInput = {
//       title: "Test MULTIPLE_CHOICE Quiz",
//       questions: [
//         {
//           questionType: "MCQ",
//           prompt: "Which one is correct?",
//           choices: [
//             { content: "Option 1", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//             { content: "Option 2", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//           ],
//           answers: ["Option 1"],
//         },
//       ],
//       lessonBlockId: lessonBlock.id,
//       folderId: folder.id,
//     };

//     const quiz = await service.createQuiz(quizInput);

//     const lessonBlockWithQuiz = await prisma.lessonBlock.findUnique({
//       where: { id: lessonBlock.id },
//       include: { quizzes: true },
//     });

//     expect(lessonBlockWithQuiz).toBeDefined();
//     expect(lessonBlockWithQuiz.quizzes).toBeDefined();
//     expect(lessonBlockWithQuiz.quizzes).toHaveLength(1);
//     expect(lessonBlockWithQuiz.quizzes[0].id).toEqual(quiz.id);
//   });

//   it("should update a quiz", async () => {
//     const quizInput: QuizInput = {
//       title: "Updated Test MULTIPLE_CHOICE Quiz",
//       questions: [
//         {
//           questionType: "MCQ",
//           prompt: "Which one is correct?",
//           choices: [
//             { content: "Option 3", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//             { content: "Option 4", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//           ],
//           answers: ["Option 3"],
//         },
//       ],
//       lessonBlockId: lessonBlock.id,
//       folderId: folder.id,
//     };

//     const existingQuiz = await service.createQuiz(quizInput);
//     const updatedQuiz = await service.updateQuiz(existingQuiz.id, quizInput);

//     expect(updatedQuiz).toBeDefined();
//     expect(updatedQuiz.title).toEqual("Updated Test MULTIPLE_CHOICE Quiz");
//   });

//   it("should delete a quiz", async () => {
//     const quizInput: QuizInput = {
//       title: "Test MULTIPLE_CHOICE Quiz",
//       questions: [
//         {
//           questionType: "MCQ",
//           prompt: "Which one is correct?",
//           choices: [
//             { content: "Option 1", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//             { content: "Option 2", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//           ],
//           answers: ["Option 1"],
//         },
//       ],
//       lessonBlockId: lessonBlock.id,
//       folderId: folder.id,
//     };

//     const newQuiz = await service.createQuiz(quizInput);
//     const deletedQuiz = await service.deleteQuiz(newQuiz.id);

//     expect(deletedQuiz).toBeDefined();
//     expect(deletedQuiz.id).toEqual(newQuiz.id);
//   });

//   it("should find all quizzes", async () => {
//     const quizzes = await service.findAllQuizzes();

//     expect(quizzes).toBeDefined();
//     expect(quizzes.length).toBeGreaterThan(0);
//   });

//   it("should find a quiz by id", async () => {
//     const quizInput: QuizInput = {
//       title: "Test MULTIPLE_CHOICE Quiz",
//       questions: [
//         {
//           questionType: "MCQ",
//           prompt: "Which one is correct?",
//           choices: [
//             { content: "Option 1", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//             { content: "Option 2", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//           ],
//           answers: ["Option 1"],
//         },
//       ],
//       lessonBlockId: lessonBlock.id,
//       folderId: folder.id,
//     };

//     const newQuiz = await service.createQuiz(quizInput);
//     const foundQuiz = await service.findQuizById(newQuiz.id);

//     expect(foundQuiz).toBeDefined();
//     expect(foundQuiz.id).toEqual(newQuiz.id);
//   });

//   it("should save quiz results", async () => {
//     const quizInput: QuizInput = {
//       title: "Test MULTIPLE_CHOICE Quiz",
//       questions: [
//         {
//           questionType: "MCQ",
//           prompt: "Which one is correct?",
//           choices: [
//             { content: "Option 1", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//             { content: "Option 2", correctAnswerDescription: "Right", incorrectAnswerDescription: "Wrong" },
//           ],
//           answers: ["Option 1"],
//         },
//       ],
//       lessonBlockId: lessonBlock.id,
//       folderId: folder.id,
//     };

//     const newQuiz = await service.createQuiz(quizInput);

//     const saveQuizResultInput: SaveQuizResultInput = {
//       quizId: newQuiz.id,
//       totalQuestions: 1,
//       correctAnswers: 1,
//       wrongAnswers: 0,
//       completionTime: Date.now(),
//       userAnswers: [
//         {
//           questionId: newQuiz.questions[0].id,
//           selectedAnswer: ["Option 1"],
//           isCorrect: true,
//         },
//       ],
//     };

//     const quizResult = await service.saveQuizResult("1", saveQuizResultInput);

//     expect(quizResult).toBeDefined();
//     expect(quizResult.userId).toEqual("1");
//     expect(quizResult.quizId).toEqual(newQuiz.id);
//     expect(quizResult.totalQuestions).toEqual(saveQuizResultInput.totalQuestions);
//     expect(quizResult.correctAnswers).toEqual(saveQuizResultInput.correctAnswers);
//   });
// });
