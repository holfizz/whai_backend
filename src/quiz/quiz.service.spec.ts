import { PrismaService } from "@/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { QuizInput } from "./dto/quiz.input";
import { QuizService } from "./quiz.service";

describe("QuizService with lesson, lessonBlock, and folder", () => {
  let service: QuizService;
  let prisma: PrismaService;

  let course;
  let folder;
  let lesson;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizService, PrismaService],
    }).compile();

    service = module.get<QuizService>(QuizService);
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
      },
    });
  });

  afterAll(async () => {
    await prisma.choice.deleteMany({
      where: {
        quiz: {
          LessonBlock: {
            lessonId: lesson.id,
          },
        },
      },
    });

    await prisma.quiz.deleteMany({
      where: {
        LessonBlock: {
          lessonId: lesson.id,
        },
      },
    });
    await prisma.lessonBlock.deleteMany({
      where: { lessonId: lesson.id },
    });
    await prisma.lesson.deleteMany({
      where: { folderId: folder.id },
    });
    await prisma.folder.deleteMany({
      where: { courseId: course.id },
    });
    await prisma.course.deleteMany({
      where: { id: course.id },
    });
  });

  it("should create a quiz and link it to a lessonBlock within a lesson and folder", async () => {
    const quizInput: QuizInput = {
      title: "Test MULTIPLE_CHOICE Quiz",
      questionType: "MCQ",
      stimulus: "Which one is correct?",
      prompt: "Choose the correct answer",
      choices: [{ content: "Option 1" }, { content: "Option 2" }],
    };

    const quiz = await service.createQuiz(quizInput);

    const lessonBlock = await prisma.lessonBlock.create({
      data: {
        lessonId: lesson.id,
        type: "QUIZ",
        quizzes: {
          connect: { id: quiz.id },
        },
      },
      include: {
        quizzes: true,
      },
    });

    expect(lessonBlock).toBeDefined();
    expect(lessonBlock.quizzes).toBeDefined();
    expect(lessonBlock.quizzes).toHaveLength(1);
    expect(lessonBlock.quizzes[0].id).toEqual(quiz.id);
  });
  it("should throw an error if matchingInteraction data is incomplete", async () => {
    const quizInput: QuizInput = {
      title: "Incomplete MATCH Quiz",
      questionType: "MATCH",
      stimulus: "Match the following",
      prompt: "Match left to right",
    };

    await expect(service.createQuiz(quizInput)).rejects.toThrow("For MATCH type, only matchingInteraction is allowed and required, but other interactions are not allowed.");
  });

  describe("createQuiz - Non-MATCH type", () => {
    it("should create a quiz with choices for non-MATCH types", async () => {
      const quizInput: QuizInput = {
        title: "Test MULTIPLE_CHOICE Quiz",
        questionType: "MCQ",
        stimulus: "Which one is correct?",
        prompt: "Choose the correct answer",
        choices: [{ content: "Option 1" }, { content: "Option 2" }],
      };

      const quiz = await service.createQuiz(quizInput);
      expect(quiz).toBeDefined();
      expect(quiz.choices).toBeDefined();
      expect(quiz.choices.length).toBeGreaterThan(0);
    });

    it("should allow additional interactions for non-MATCH types", async () => {
      const quizInput: QuizInput = {
        title: "Test with Interactions",
        questionType: "MCQ",
        stimulus: "Which one is correct?",
        prompt: "Choose the correct answer",
        choices: [{ content: "Option 1" }, { content: "Option 2" }],
        interactions: [
          {
            choices: [{ content: "Choice A" }, { content: "Choice B" }],
            answers: ["Choice A"],
          },
        ],
      };

      const quiz = await service.createQuiz(quizInput);
      expect(quiz).toBeDefined();
      const interactions = await prisma.interaction.findMany({
        where: { quizId: quiz.id },
      });
      expect(interactions.length).toBeGreaterThan(0);
    });
  });

  it("should update a quiz", async () => {
    const quizInput: QuizInput = {
      title: "Updated Test MULTIPLE_CHOICE Quiz",
      questionType: "MCQ",
      stimulus: "Which one is correct?",
      prompt: "Choose the correct answer",
      choices: [{ content: "Option 3" }, { content: "Option 4" }],
    };

    const existingQuiz = await service.createQuiz(quizInput);
    const updatedQuiz = await service.updateQuiz(existingQuiz.id, quizInput);

    expect(updatedQuiz).toBeDefined();
    expect(updatedQuiz.title).toEqual("Updated Test MULTIPLE_CHOICE Quiz");
  });

  it("should delete a quiz", async () => {
    const quizInput: QuizInput = {
      title: "Test MULTIPLE_CHOICE Quiz",
      questionType: "MCQ",
      stimulus: "Which one is correct?",
      prompt: "Choose the correct answer",
      choices: [{ content: "Option 1" }, { content: "Option 2" }],
    };

    const newQuiz = await service.createQuiz(quizInput);
    const deletedQuiz = await service.deleteQuiz(newQuiz.id);

    expect(deletedQuiz).toBeDefined();
    expect(deletedQuiz.id).toEqual(newQuiz.id);
  });

  it("should find all quizzes", async () => {
    const quizzes = await service.findAllQuizzes();

    expect(quizzes).toBeDefined();
    expect(quizzes.length).toBeGreaterThan(0);
  });

  it("should find a quiz by id", async () => {
    const quizInput: QuizInput = {
      title: "Test MULTIPLE_CHOICE Quiz",
      questionType: "MCQ",
      stimulus: "Which one is correct?",
      prompt: "Choose the correct answer",
      choices: [{ content: "Option 1" }, { content: "Option 2" }],
    };

    const newQuiz = await service.createQuiz(quizInput);
    const foundQuiz = await service.findQuizById(newQuiz.id);

    expect(foundQuiz).toBeDefined();
    expect(foundQuiz.id).toEqual(newQuiz.id);
  });
});
