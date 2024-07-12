import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput, SaveQuizResultInput, UserAnswerInput } from "./dto/quiz.input";
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
        questions: true,
        quizResult: {
          // Используем множественное число, если у викторины может быть несколько результатов
          where: { userId },
          include: {
            userAnswers: true,
          },
          orderBy: {
            totalPercents: "desc",
          },
        },
      },
    });

    if (!quiz) {
      throw new Error(`Quiz with id ${quizId} not found.`);
    }

    // Получаем все результаты викторины пользователя
    const quizResults = quiz.quizResult;

    if (!quizResults || quizResults.length === 0) {
      throw new Error(`No quiz results found for user ${userId} and quiz ${quizId}.`);
    }

    // Находим лучший результат (первый по убыванию totalPercents)
    const bestQuizResult = quizResults[0];

    // Рассчитываем статистику для лучшего результата
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    bestQuizResult.userAnswers.forEach(userAnswer => {
      if (userAnswer.isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    });

    const totalPercents = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Возвращаем объект Quiz с информацией о лучшем результате
    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      questions: quiz.questions.map(question => ({
        id: question.id,
        answers: question.answers,
        questionType: question.questionType,
      })),
      quizResult: {
        id: bestQuizResult.id,
        userId: bestQuizResult.userId,
        quizId: bestQuizResult.quizId,
        courseId: bestQuizResult.courseId,
        totalPercents,
        correctAnswers,
        wrongAnswers,
        userAnswers: bestQuizResult.userAnswers.map(userAnswer => ({
          questionId: userAnswer.questionId,
          selectedAnswer: userAnswer.selectedAnswer,
          isCorrect: userAnswer.isCorrect,
        })),
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
    console.log(JSON.parse(JSON.stringify(quizJson)));
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with id ${userId} does not exist.`);
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
    });
    if (!quiz) {
      throw new Error(`Quiz with id ${dto.quizId} does not exist.`);
    }

    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new Error(`Course with id ${dto.courseId} does not exist.`);
      }
    }

    if (dto.subtopicId) {
      const subtopic = await this.prisma.subtopic.findUnique({
        where: { id: dto.subtopicId },
      });
      if (!subtopic) {
        throw new Error(`Subtopic with id ${dto.subtopicId} does not exist.`);
      }
    }

    const questions = await this.prisma.question.findMany({
      where: { quizId: dto.quizId },
      include: { choices: true, interactions: true, matchingInteraction: true },
    });

    const questionMap = new Map<string, any>();
    questions.forEach(question => {
      if (question.questionType === "MATCH") {
        questionMap.set(question.id, question.matchingInteraction.answers);
      } else {
        questionMap.set(
          question.id,
          question.choices.map(choice => choice.content),
        );
      }
    });

    const quizResult = await this.prisma.$transaction(async prisma => {
      const createdQuizResult = await prisma.quizResult.create({
        data: {
          userId: userId,
          quizId: dto.quizId,
          courseId: dto.courseId || undefined,
          subtopicId: dto.subtopicId || undefined,
          totalPercents: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
        },
      });

      let correctAnswersCount = 0;
      let wrongAnswersCount = 0;

      await Promise.all(
        dto.userAnswers.map(async (userAnswer: UserAnswerInput) => {
          const { questionId, selectedAnswer, matchingAnswers } = userAnswer;
          const correctAnswersForQuestion = questionMap.get(questionId);

          let isCorrect = false;

          if (matchingAnswers) {
            const userMatchingAnswers = matchingAnswers.map(match => match.value);
            isCorrect = JSON.stringify(userMatchingAnswers) === JSON.stringify(correctAnswersForQuestion);
          } else if (Array.isArray(selectedAnswer)) {
            isCorrect =
              Array.isArray(correctAnswersForQuestion) &&
              selectedAnswer.length === correctAnswersForQuestion.length &&
              selectedAnswer.every(answer => correctAnswersForQuestion.includes(answer));
          } else {
            isCorrect = Array.isArray(correctAnswersForQuestion) && correctAnswersForQuestion.includes(selectedAnswer);
          }

          await prisma.userAnswer.create({
            data: {
              quizResultId: createdQuizResult.id,
              questionId: questionId,
              selectedAnswer: JSON.stringify(matchingAnswers || selectedAnswer),
              isCorrect: isCorrect,
            },
          });

          if (isCorrect) {
            correctAnswersCount++;
          } else {
            wrongAnswersCount++;
          }
        }),
      );

      const totalQuestions = dto.userAnswers.length;
      const totalPercents = (correctAnswersCount / totalQuestions) * 100;

      const updatedQuizResult = await prisma.quizResult.update({
        where: { id: createdQuizResult.id },
        data: {
          totalPercents: totalPercents,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
        },
      });

      const userAnswers = await prisma.userAnswer.findMany({
        where: { quizResultId: updatedQuizResult.id },
      });

      return {
        id: updatedQuizResult.id,
        userId: updatedQuizResult.userId,
        quizId: updatedQuizResult.quizId,
        courseId: updatedQuizResult.courseId,
        subtopicId: updatedQuizResult.subtopicId,
        totalPercents: updatedQuizResult.totalPercents,
        correctAnswers: updatedQuizResult.correctAnswers,
        wrongAnswers: updatedQuizResult.wrongAnswers,
        userAnswers: userAnswers,
      };
    });

    // Return result wrapped in an array if schema expects an iterable
    return [quizResult];
  }
}
