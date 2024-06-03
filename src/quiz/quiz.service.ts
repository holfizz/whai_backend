import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { QuizResult } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput, SaveQuizResultInput } from "./dto/quiz.input";
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

  async createQuiz(data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.quizRepository.validateFolderAndLesson(data);

      const newQuiz = await this.quizRepository.createQuiz(data);

      for (const question of data.questions) {
        await this.quizRepository.createQuestion(question, newQuiz.id);
      }

      const quizStats = await this.quizUtils.calculateQuizStats(newQuiz.id);
      await this.quizRepository.updateQuizStats(newQuiz.id, quizStats);

      return this.quizRepository.findQuizById(newQuiz.id);
    });
  }

  async findAllQuizzes(): Promise<any> {
    return await this.quizRepository.findAllQuizzes();
  }

  async findQuizById(id: string): Promise<any> {
    return await this.quizRepository.findQuizById(id);
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
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, dto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const quizJson = this.extractQuizJson(fullContent);
    const parsedContent = JSON.parse(quizJson);
    const { title, questions } = parsedContent;

    await this.createQuiz({ title, questions, lessonBlockId: dto.lessonBlockId, folderId: dto.folderId });

    return parsedContent;
  }

  private extractQuizJson(content: string): string {
    const match = content.match(/```quiz\n([\s\S]*?)\n```/);
    if (!match || match.length < 2) throw new Error("Cannot find quiz JSON in the provided content.");
    return match[1];
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
  async saveQuizResult(userId: string, dto: SaveQuizResultInput): Promise<QuizResult> {
    return await this.prisma.$transaction(async prisma => {
      // Проверяем, существует ли пользователь с указанным userId
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new Error(`User with id ${userId} does not exist.`);
      }

      // Проверяем, существует ли курс с указанным courseId (если он передан)
      if (dto.courseId) {
        const courseExists = await prisma.course.findUnique({
          where: { id: dto.courseId },
        });
        if (!courseExists) {
          throw new Error(`Course with id ${dto.courseId} does not exist.`);
        }
      }

      // Проверяем, существует ли урок с указанным lessonId (если он передан)
      if (dto.lessonId) {
        const lessonExists = await prisma.lesson.findUnique({
          where: { id: dto.lessonId },
        });
        if (!lessonExists) {
          throw new Error(`Lesson with id ${dto.lessonId} does not exist.`);
        }
      }

      const quizResult = await prisma.quizResult.create({
        data: {
          userId: userId,
          quizId: dto.quizId,
          courseId: dto.courseId || null,
          lessonId: dto.lessonId || null,
          totalQuestions: dto.totalQuestions,
          correctAnswers: dto.correctAnswers,
          wrongAnswers: dto.wrongAnswers,
          completionTime: dto.completionTime,
        },
      });

      const userAnswersPromises = dto.userAnswers.map(userAnswer =>
        prisma.userAnswer.create({
          data: {
            quizResultId: quizResult.id,
            questionId: userAnswer.questionId,
            selectedAnswer: userAnswer.selectedAnswer,
            isCorrect: userAnswer.isCorrect,
          },
        }),
      );
      await Promise.all(userAnswersPromises);

      const savedUserAnswers = await prisma.userAnswer.findMany({
        where: { quizResultId: quizResult.id },
      });

      return {
        ...quizResult,
        userAnswers: savedUserAnswers,
      };
    });
  }
}
