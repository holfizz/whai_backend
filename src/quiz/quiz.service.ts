import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput, SaveQuizResultInput } from "./dto/quiz.input";
import { QuizRepository } from "./quiz.repository";
import { QuizUtils } from "./quiz.utils";
import { AIDTO } from "@/edu-ai/types/ai.types";

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private readonly eduAiService: EduAiService,
    private readonly quizRepository: QuizRepository,
    private readonly quizUtils: QuizUtils,
  ) {}

  async createQuiz(data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      // await this.quizRepository.validateSubtopicAndLesson(data);

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

  async getAllQuizzes(subtopicId: string): Promise<any> {
    return await this.quizRepository.findAllQuizzes(subtopicId);
  }

  async getQuiz(quizId: string, userId: string): Promise<any> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true,
            interactions: true,
            matchingInteraction: true,
          },
        },
        quizResult: {
          where: { userId },
          include: {
            userAnswer: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error(`Quiz with id ${quizId} not found.`);
    }

    // Assume there's only one quizResult per user per quiz
    const quizResult = quiz.quizResult[0];

    if (!quizResult) {
      throw new Error(`No quiz result found for user ${userId}.`);
    }

    // Calculate quiz statistics
    const totalQuestions = quiz.questions.length;
    const correctAnswers = quizResult.userAnswer.isCorrect ? 1 : 0; // Assuming userAnswer is an object
    const wrongAnswers = totalQuestions - correctAnswers;
    const totalPercents = (correctAnswers / totalQuestions) * 100;

    // Prepare the quiz response
    return {
      ...quiz,
      quizResult: {
        ...quizResult,
        correctAnswers,
        wrongAnswers,
        totalPercents,
      },
    };
  }

  async deleteQuiz(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        await this.quizRepository.deleteQuizAndRelatedEntities(id);
      })
      .catch(error => {
        throw new Error(`Failed to delete quiz and its related entities: ${error.message}`);
      });
  }

  async updateQuiz(id: string, data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.quizRepository.updateQuiz(id, data);
    });
  }

  async createQuizWithAI(userId: string, dto: QuizWithAIInput, pubSub: PubSub): Promise<any> {
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    const aiDto: AIDTO = {
      content: {
        createType: "Тест",
        descriptionType: "Создай тест",
        quizTitle: dto.name,
        quizDescription: dto.description,
        additionalParams: dto.additionalParams,
      },
      messagesHistory,
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    console.log(1, fullContent);
    const quizJson = this.extractQuizJson(fullContent);
    console.log(2, quizJson);

    const parsedContent = JSON.parse(quizJson);
    console.log(3, parsedContent);

    const { questions, completionTime } = parsedContent;

    return this.createQuiz({
      name: dto.name,
      description: dto.description,
      questions: JSON.parse(JSON.stringify(questions)),
      completionTime: Number(completionTime),
      subtopicId: dto.subtopicId,
      courseId: dto.courseId,
    });
  }

  private extractQuizJson(content: string): string {
    const patterns = [/```quiz\n```json\n([\s\S]*?)\n```\n```/, /```json\n```quiz\n([\s\S]*?)\n```\n```/, /```quiz\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find quiz JSON in the provided content.");
    }
    let quizJson = match[1];
    console.log(quizJson);
    if (quizJson.trim().startsWith("json")) {
      quizJson = quizJson.replace(/^json\s*/, "");
    }
    console.log(quizJson);
    try {
      JSON.parse(quizJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return quizJson;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }

  async saveQuizResult(userId: string, dto: SaveQuizResultInput): Promise<any> {
    // Check if the user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new Error(`User with id ${userId} does not exist.`);
    }

    // Check if the course exists, if provided
    if (dto.courseId) {
      const courseExists = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!courseExists) {
        throw new Error(`Course with id ${dto.courseId} does not exist.`);
      }
    }

    // Check if the subtopic exists, if provided
    if (dto.subtopicId) {
      const subtopicExists = await this.prisma.subtopic.findUnique({
        where: { id: dto.subtopicId },
      });
      if (!subtopicExists) {
        throw new Error(`Subtopic with id ${dto.subtopicId} does not exist.`);
      }
    }

    // Perform the transaction
    return await this.prisma.$transaction(async prisma => {
      // Create user answer
      const userAnswer = await prisma.userAnswer.create({
        data: {
          questionId: dto.userAnswer.questionId,
          selectedAnswer: dto.userAnswer.selectedAnswer,
          isCorrect: dto.userAnswer.isCorrect,
        },
      });

      // Create the quiz result and link the user answer
      const quizResult = await prisma.quizResult.create({
        data: {
          userId: userId,
          quizId: dto.quizId,
          courseId: dto.courseId,
          subtopicId: dto.subtopicId || null,
          totalPercents: dto.totalPercents,
          correctAnswers: dto.correctAnswers,
          wrongAnswers: dto.wrongAnswers,
          userAnswerId: userAnswer.id, // Link the user answer to the quiz result
        },
        include: {
          userAnswer: true,
        },
      });

      // Return the quiz result with the saved user answer
      return {
        ...quizResult,
        userAnswer,
      };
    });
  }
}
