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
    console.log(1, fullContent);
    const quizJson = this.extractQuizJson(fullContent);
    console.log(2, quizJson);

    const parsedContent = JSON.parse(quizJson);
    console.log(3, parsedContent);

    const { name, questions, completionTime } = parsedContent;

    await this.createQuiz({
      name,
      questions,
      completionTime: Number(completionTime),
      lessonBlockId: dto.lessonBlockId,
      subtopicId: dto.subtopicId,
      courseId: dto.courseId,
    });

    return parsedContent;
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

  async saveQuizResult(userId: string, dto: SaveQuizResultInput): Promise<QuizResult> {
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
      console.log(subtopicExists);
      if (!subtopicExists) {
        throw new Error(`Subtopic with id ${dto.subtopicId} does not exist.`);
      }
    }

    return await this.prisma.$transaction(async prisma => {
      // Check if the user exists

      // Create the quiz result
      const quizResult = await prisma.quizResult.create({
        data: {
          userId: userId,
          quizId: dto.quizId,
          courseId: dto.courseId,
          lessonId: dto.lessonId,
          subtopicId: dto.subtopicId,
          totalQuestions: dto.totalQuestions,
          correctAnswers: dto.correctAnswers,
          wrongAnswers: dto.wrongAnswers,
          completionTime: dto.completionTime,
        },
      });

      // Create user answers
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

      // Fetch saved user answers
      const savedUserAnswers = await prisma.userAnswer.findMany({
        where: { quizResultId: quizResult.id },
      });

      // Return the quiz result with saved user answers
      return {
        ...quizResult,
        userAnswers: savedUserAnswers,
      };
    });
  }
}
