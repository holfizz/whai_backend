import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { UpdateQuizInput } from "@/quiz/dto/update-quiz.input";
import { Quiz, QuizSummary } from "@/quiz/entities/quiz.entity";
import { Injectable } from "@nestjs/common";
import { QuizQuestionType } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { QuizIndependentWithAIInput, QuizInput, QuizWithAIInput, SaveQuizResultInput, UserAnswerInput } from "./dto/quiz.input";
import { QuizRepository } from "./quiz.repository";
import { QuizUtils } from "./quiz.utils";

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private readonly eduAiService: EduAiService,
    private readonly quizRepository: QuizRepository,
    private readonly quizUtils: QuizUtils,
  ) {}

  async createQuizFromAI(data: UpdateQuizInput): Promise<Quiz> {
    logger.log("createQuizFromAI - data:", data);

    return await this.prisma.$transaction(async prisma => {
      if (!data.id) {
        throw new Error("Failed to update quiz or quiz ID is missing.");
      }

      if (data.questions) {
        for (const question of data.questions) {
          logger.log("createQuizFromAI - Creating question:", question);
          await this.quizRepository.createQuestion(question, data.id);
        }
      }

      const quizStats = await this.quizUtils.calculateQuizStats(data.id);
      await this.quizRepository.updateQuizStats(data.id, quizStats);
      await this.prisma.quiz.update({ where: { id: data.id }, data: { isPlan: false } });
      return this.quizRepository.findQuizById(data.id);
    });
  }
  async createQuizWithAI(userId: string, dto: QuizWithAIInput, pubSub: PubSub): Promise<Quiz> {
    // Проверка наличия квиза
    const quiz = await this.prisma.quiz.findUnique({ where: { id: dto.id } });
    if (!quiz) throw new Error(`Quiz with ID ${dto.id} not found.`);

    // Проверка наличия курса
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new Error(`Course with ID ${dto.courseId} not found.`);

    // Получение информации о пользователе
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Проверка ограничения на количество дополнительных квизов, если isAdditional = true
    if (quiz.isAdditional && user.currentLessonCount <= 0) {
      throw new Error("You have reached your quiz creation limit for this month.");
    }

    // Формирование AI-запроса
    const aiDto: AIDTO = {
      content: {
        createType: "Тест",
        descriptionType: "Создай тест",
        quizTitle: dto.name,
        quizDescription: dto.description,
        courseTitle: course.name,
        courseDescription: course.description,
        additionalParams: dto.additionalParams,
      },
    };

    // Получение ответа от AI-сервиса
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.courseAIHistoryId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const quizJson = this.extractQuizJson(fullContent);
    const parsedContent = JSON.parse(quizJson);

    const { questions } = parsedContent;

    const createdQuiz = await this.createQuizFromAI({
      id: quiz.id,
      name: dto.name,
      description: dto.description,
      questions: questions,
      subtopicId: dto.subtopicId,
      courseId: dto.courseId,
    });
    if (quiz.isAdditional) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentLessonCount: { decrement: 1 } },
      });
    }

    return createdQuiz;
  }

  async createQuiz(data: QuizInput): Promise<Quiz> {
    return await this.prisma.$transaction(async prisma => {
      const newQuiz = await this.quizRepository.createQuiz(data);

      if (data.questions) {
        for (const question of data.questions) {
          await this.quizRepository.createQuestion(question, newQuiz.id);
        }
      }
      const quizStats = await this.quizUtils.calculateQuizStats(newQuiz.id);
      await this.quizRepository.updateQuizStats(newQuiz.id, quizStats);

      return this.quizRepository.findQuizById(newQuiz.id);
    });
  }

  async getAllQuizzes(subtopicId: string): Promise<QuizSummary[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: { subtopicId },
      include: {
        quizResult: {
          include: { userAnswers: true },
        },
        questions: {
          include: {
            choices: true,
            matchingInteraction: true,
          },
        },
      },
    });

    console.log("Quizzes:", quizzes);

    return quizzes.map(quiz => {
      // Найти лучший результат
      const bestQuizResult = quiz.quizResult.reduce((best, current) => {
        return current.totalPercents > (best?.totalPercents ?? 0) ? current : best;
      }, null);

      console.log("Best Quiz Result:", bestQuizResult);

      if (bestQuizResult) {
        const totalQuestions = quiz.questions.length;
        const userAnswers = bestQuizResult.userAnswers;

        console.log("Total Questions:", totalQuestions);
        console.log("User Answers:", userAnswers);

        // Подсчёт правильных ответов и общего количества ответов
        const correctAnswersCount = userAnswers.filter(ua => ua.correctnessPercentage === 100).length;
        const totalAnswersCount = userAnswers.length;

        console.log("Correct Answers Count:", correctAnswersCount);
        console.log("Total Answers Count:", totalAnswersCount);

        // Расчет процентов выполненных заданий
        const totalPercents = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

        console.log("Total Percents:", totalPercents);

        return {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          totalPercents: bestQuizResult.totalPercents,
          correctAnswers: correctAnswersCount,
          wrongAnswers: totalQuestions - correctAnswersCount,
        };
      }

      return {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        totalPercents: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      };
    });
  }

  async getAllIndependentQuizzes(userId: string): Promise<QuizSummary[]> {
    // Fetch quizzes matching the criteria
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        userId: userId,
        AND: [
          { subtopicId: null },
          { courseId: null },
          {
            quizResult: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        quizResult: {
          include: { userAnswers: true },
        },
        questions: {
          include: {
            choices: true,
            matchingInteraction: true,
          },
        },
      },
    });

    return quizzes.map(quiz => {
      const bestQuizResult = quiz.quizResult.reduce((best, current) => (current.totalPercents > (best?.totalPercents ?? 0) ? current : best), null);

      if (bestQuizResult) {
        const totalQuestions = quiz.questions.length;
        const userAnswers = bestQuizResult.userAnswers;

        const correctAnswersCount = userAnswers.filter(ua => ua.correctnessPercentage === 100).length;
        const wrongAnswersCount = userAnswers.length - correctAnswersCount;

        const totalPercents = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

        return {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          totalPercents,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
        };
      }

      return {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        totalPercents: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      };
    });
  }

  async getQuiz(quizId: string, userId: string): Promise<any> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true,
            matchingInteraction: true,
          },
        },
        quizResult: {
          where: { userId },
          include: { userAnswers: true },
          orderBy: { totalPercents: "desc" },
        },
      },
    });

    if (!quiz) {
      throw new Error(`Quiz with id ${quizId} not found.`);
    }

    logger.log("Quiz:", quiz);

    const quizResults = quiz.quizResult;
    logger.log("Quiz Results:", quizResults);

    // Проверка наличия результатов
    if (!quizResults || quizResults.length === 0) {
      logger.log("No results found for this user and quiz.");
      return {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        subtopicId: quiz.subtopicId,
        courseId: quiz.courseId,
        questions: quiz.questions,
        quizResult: null,
      };
    }

    // Получение лучшего результата
    const bestQuizResult = quizResults.reduce((best, current) => (current.totalPercents > (best?.totalPercents ?? 0) ? current : best), null);

    logger.log("Best Quiz Result:", bestQuizResult);

    let userAnswers = [];

    if (bestQuizResult) {
      userAnswers = await Promise.all(
        bestQuizResult.userAnswers.map(async userAnswer => {
          const question = await this.prisma.question.findUnique({ where: { id: userAnswer.questionId } });
          if (!question) {
            throw new Error(`Question with id ${userAnswer.questionId} not found.`);
          }

          return {
            questionId: userAnswer.questionId,
            selectedAnswers: userAnswer.selectedAnswers,
            correctAnswers: userAnswer.correctAnswers,
          };
        }),
      );
    }

    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      subtopicId: quiz.subtopicId,
      courseId: quiz.courseId,
      questions: quiz.questions,
      quizResult: bestQuizResult
        ? {
            id: bestQuizResult.id,
            userId: bestQuizResult.userId,
            quizId: bestQuizResult.quizId,
            courseId: bestQuizResult.courseId,
            subtopicId: bestQuizResult.subtopicId,

            totalPercents: bestQuizResult.totalPercents,
            userAnswers,
          }
        : null,
    };
  }

  async deleteQuiz(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        await prisma.userAnswer.deleteMany({ where: { quizResult: { quizId: id } } });
        await prisma.quizResult.deleteMany({ where: { quizId: id } });
        await prisma.choice.deleteMany({ where: { question: { quizId: id } } });
        await prisma.matchingInteraction.deleteMany({ where: { question: { quizId: id } } });
        await prisma.question.deleteMany({ where: { quizId: id } });
        await prisma.quiz.delete({ where: { id } });
      })
      .catch(error => {
        throw new Error(`Failed to delete quiz and its related entities: ${error.message}`);
      });
  }

  async updateQuiz(data: UpdateQuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.quizRepository.updateQuiz(data.id, data);
    });
  }

  private extractQuizJson(content: string): string {
    const quizPattern = /```quiz([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let quizMatch = content.match(quizPattern);
    if (!quizMatch || quizMatch.length < 2) {
      console.error("Cannot find quiz block in the provided content.");
      throw new Error("Cannot find quiz block in the provided content.");
    }
    let quizContent = quizMatch[1].trim();
    let jsonMatch = quizContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      quizContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        quizContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(quizContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", quizContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return quizContent;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
  async saveQuizResult(userId: string, saveQuizResultInput: SaveQuizResultInput): Promise<any> {
    const { quizId, courseId, subtopicId, userAnswers } = saveQuizResultInput;

    return await this.prisma.$transaction(async prisma => {
      const quiz = await this.quizRepository.findQuizById(quizId);
      if (!quiz) throw new Error(`Quiz with id ${quizId} not found.`);

      const userAnswerEntities = [];
      let totalCorrectness = 0;
      logger.log("userAnswer.selectedAnswers", userAnswers);

      for (const userAnswer of userAnswers) {
        const question = await this.prisma.question.findUnique({
          where: { id: userAnswer.questionId },
          include: {
            choices: true,
            matchingInteraction: true,
          },
        });

        if (!question) throw new Error(`Question with id ${userAnswer.questionId} not found.`);

        const { correctnessPercentage, correctAnswers } = this.calculateCorrectness(question, userAnswer);

        logger.log("userAnswer.selectedAnswers", userAnswer.selectedAnswers);
        userAnswerEntities.push({
          questionId: userAnswer.questionId,
          selectedAnswers: userAnswer.selectedAnswers,
          matchingAnswers: userAnswer.matchingAnswers || [],
          correctnessPercentage,
          correctAnswers,
        });

        totalCorrectness += correctnessPercentage;
      }

      const totalQuestions = userAnswers.length;
      const averageCorrectnessPercentage = totalQuestions > 0 ? totalCorrectness / totalQuestions : 0;
      await this.prisma.quiz.update({ where: { id: quizId }, data: { isCompleted: true } });
      const quizResult = await this.prisma.quizResult.create({
        data: {
          userId,
          quizId,
          courseId,
          subtopicId,
          totalPercents: averageCorrectnessPercentage,
          userAnswers: {
            create: userAnswerEntities,
          },
        },
        include: {
          userAnswers: true,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user.isQuizCompleted) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { isQuizCompleted: true },
        });
      }

      return quizResult;
    });
  }

  private calculateCorrectness(question, userAnswer: UserAnswerInput) {
    let correctnessPercentage = 0;
    let correctAnswers: string[] = [];
    switch (question.questionType) {
      case QuizQuestionType.MCQ:
        correctnessPercentage = question.answers.includes(userAnswer.selectedAnswers[0]) ? 100 : 0;
        correctAnswers = question.answers;
        break;

      case QuizQuestionType.CLOZE:
      case QuizQuestionType.MRQ:
        const correctCount = userAnswer.selectedAnswers.filter(ans => question.answers.includes(ans)).length;
        const totalAnswers = question.answers.length;
        correctnessPercentage = (correctCount / totalAnswers) * 100;
        correctAnswers = question.answers;
        break;

      case QuizQuestionType.MATCH:
        if (Array.isArray(userAnswer.matchingAnswers)) {
          const matchAnswers = userAnswer.matchingAnswers;
          const correctAnswers = question.matchingInteraction.answers.map(([left, right]) => ({ left, right }));

          if (correctAnswers.length === 0) {
            console.warn("Warning: correctAnswers is empty.");
            correctnessPercentage = 0;
            break;
          }
          const totalPairs = correctAnswers.length;
          logger.log("totalPairs", totalPairs);
          const correctPairs = matchAnswers.reduce((count, answer) => {
            const isCorrect = correctAnswers.some(correctAnswer => correctAnswer.left === answer.left && correctAnswer.right === answer.right);
            return count + (isCorrect ? 1 : 0);
          }, 0);
          correctnessPercentage = totalPairs > 0 ? (correctPairs / totalPairs) * 100 : 0;
        } else {
          correctnessPercentage = 0;
        }

        break;
    }

    return { correctnessPercentage, correctAnswers };
  }
  async getLastSaveQuizResult(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new Error(`Quiz with id ${quizId} does not exist`);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} does not exist`);
    }

    const quizResult = await this.prisma.quizResult.findFirst({
      where: {
        userId,
        quizId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        userAnswers: true,
      },
    });
    return quizResult;
  }
  async createIndependentQuizWithAI(userId: string, dto: QuizIndependentWithAIInput, pubSub: PubSub): Promise<Quiz> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    if (user.currentLessonCount <= 0) {
      throw new Error("You have reached your quiz creation limit for this month.");
    }
    const aiDto: AIDTO = {
      content: {
        createType: dto.toCheckKnowledge ? "Знания" : "Тест",
        descriptionType: dto.toCheckKnowledge ? "Создай тест на проверку знаний" : "Создай тест",
        courseTitle: dto.courseTitle,
        courseDescription: dto.courseDescription,
      },
    };
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.courseAIHistoryId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const quizJson = this.extractQuizJson(fullContent);
    const parsedContent = JSON.parse(quizJson);

    const { questions } = parsedContent;

    const quiz = await this.prisma.quiz.create({
      data: { name: "Test for testing knowledge", userId, isAdditional: true },
    });
    if (!quiz) {
      throw new Error("Failed to create quiz.");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { currentLessonCount: { decrement: 1 } },
    });

    return this.createQuizFromAI({
      id: quiz.id,
      name: dto.courseTitle,
      description: dto.courseDescription,
      questions: questions,
    });
  }
}
