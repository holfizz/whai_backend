import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput, SaveQuizResultInput, UserAnswerInput } from "./dto/quiz.input";
import { QuizRepository } from "./quiz.repository";
import { QuizUtils } from "./quiz.utils";
import { AIDTO } from "@/edu-ai/types/ai.types";
import { QuizSummary } from "@/quiz/entities/quiz.entity";

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

  async getAllQuizzes(subtopicId: string): Promise<QuizSummary[]> {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        subtopicId,
      },
      include: {
        quizResult: {
          include: {
            userAnswers: true,
          },
          orderBy: {
            totalPercents: "desc",
          },
          take: 1, // Берем только лучший результат
        },
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    const quizSummaries = quizzes.map(quiz => {
      let bestQuizResult = null;
      if (quiz.quizResult.length > 0) {
        bestQuizResult = quiz.quizResult[0];
      }

      let totalPercents = 0;

      if (bestQuizResult) {
        const totalQuestions = quiz.questions.length;
        const correctAnswers = bestQuizResult.correctAnswers;
        totalPercents = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      }

      return {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        totalPercents,
      };
    });

    return quizSummaries;
  }

  async getQuiz(quizId: string, userId: string): Promise<any> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
        quizResult: {
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

    const quizResults = quiz.quizResult;

    const bestQuizResult = quizResults.length > 0 ? quizResults[0] : null;

    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let userAnswers = [];

    if (bestQuizResult) {
      bestQuizResult.userAnswers.forEach(userAnswer => {
        if (userAnswer.isCorrect) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }

        // Check if selectedAnswer is a string and parse it
        let parsedSelectedAnswer: any;
        if (typeof userAnswer.selectedAnswer === "string") {
          parsedSelectedAnswer = JSON.parse(userAnswer.selectedAnswer);
        } else {
          parsedSelectedAnswer = userAnswer.selectedAnswer;
        }

        // Ensure selectedAnswer is an array
        if (!Array.isArray(parsedSelectedAnswer)) {
          parsedSelectedAnswer = [parsedSelectedAnswer];
        }

        userAnswers.push({
          questionId: userAnswer.questionId,
          selectedAnswer: parsedSelectedAnswer, // Handle different types of selectedAnswer
          isCorrect: userAnswer.isCorrect,
        });
      });
    }

    const totalPercents = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      id: quiz.id,
      name: quiz.name,
      subtopicId: quiz.subtopicId,
      description: quiz.description,
      questions: quiz.questions.map(question => ({
        id: question.id,
        prompt: question.prompt,
        questionType: question.questionType,
        choices: question.choices,
      })),
      quizResult: bestQuizResult
        ? {
            id: bestQuizResult.id,
            userId: bestQuizResult.userId,
            quizId: bestQuizResult.quizId,
            courseId: bestQuizResult.courseId,
            subtopicId: bestQuizResult.subtopicId,
            totalPercents,
            correctAnswers,
            wrongAnswers,
            userAnswers,
          }
        : null,
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
    const aiDto: AIDTO = {
      content: {
        createType: "Тест",
        descriptionType: "Создай тест",
        quizTitle: dto.name,
        quizDescription: dto.description,
        additionalParams: dto.additionalParams,
      },
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const quizJson = this.extractQuizJson(fullContent);
    const parsedContent = JSON.parse(quizJson);

    const { questions, completionTime } = parsedContent;

    return this.createQuiz({
      name: dto.name,
      description: dto.description,
      questions: questions,
      subtopicId: dto.subtopicId,
      courseId: dto.courseId,
    });
  }

  private extractQuizJson(content: string): string {
    // Patterns to match JSON content within specific markers
    const patterns = [/```quiz\n```json\n([\s\S]*?)\n```\n```/, /```json\n```quiz\n([\s\S]*?)\n```\n```/, /```quiz\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];

    let match = null;

    // Find the first matching pattern
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }

    // If no match is found, throw an error
    if (!match || match.length < 2) {
      throw new Error("Cannot find quiz JSON in the provided content.");
    }

    let quizJson = match[1].trim();

    // Clean up the string: remove any leading or trailing unnecessary characters
    // This removes nested markers and unnecessary escapes
    quizJson = quizJson.replace(/(^```(quiz|json)\n|```$)/g, "").trim();

    // Try to parse the JSON to ensure it is valid
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
    // Check user existence
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with id ${userId} does not exist.`);
    }

    // Check quiz existence
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
    });
    if (!quiz) {
      throw new Error(`Quiz with id ${dto.quizId} does not exist.`);
    }

    // Check course existence, if specified
    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new Error(`Course with id ${dto.courseId} does not exist.`);
      }
    }

    // Check subtopic existence, if specified
    if (dto.subtopicId) {
      const subtopic = await this.prisma.subtopic.findUnique({
        where: { id: dto.subtopicId },
      });
      if (!subtopic) {
        throw new Error(`Subtopic with id ${dto.subtopicId} does not exist.`);
      }
    }

    // Process user answers and save results
    const userAnswers = await Promise.all(
      dto.userAnswers.map(async (answer: UserAnswerInput) => {
        const question = await this.prisma.question.findUnique({
          where: { id: answer.questionId },
        });
        if (!question) {
          throw new Error(`Question with id ${answer.questionId} does not exist.`);
        }

        let selectedAnswer: any;
        if (question.questionType === "MATCH") {
          selectedAnswer = JSON.stringify(answer.matchingAnswers?.map(ma => ma.value));
        } else {
          selectedAnswer = JSON.stringify(answer.selectedAnswer);
        }

        return {
          questionId: answer.questionId,
          selectedAnswer,
          isCorrect: this.checkAnswerCorrectness(question, answer),
        };
      }),
    );

    // Calculate correct and wrong answers
    const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
    const wrongAnswersCount = userAnswers.length - correctAnswersCount;

    // Save quiz result
    const quizResult = await this.prisma.quizResult.create({
      data: {
        userId,
        quizId: dto.quizId,
        courseId: dto.courseId,
        subtopicId: dto.subtopicId,
        correctAnswers: correctAnswersCount,
        wrongAnswers: wrongAnswersCount,
        totalPercents: Math.round((correctAnswersCount / userAnswers.length) * 100),
      },
    });

    // Link user answers to quiz result
    await Promise.all(
      userAnswers.map(async answer => {
        await this.prisma.userAnswer.create({
          data: {
            quizResultId: quizResult.id,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
          },
        });
      }),
    );

    // Return the quiz result along with user answers
    return {
      ...quizResult,
      userAnswers,
    };
  }

  private checkAnswerCorrectness(question: any, answer: UserAnswerInput): boolean {
    if (question.questionType === "MATCH") {
      // Retrieve the correct answers for the matching question from your application logic or hardcoded for now
      const correctAnswers = [
        ["do", "did"],
        ["have", "had"],
        ["make", "made"],
        ["go", "went"],
        ["see", "saw"],
      ];

      const expectedAnswers = correctAnswers.map(ma => ma.sort());
      const givenAnswers = answer.matchingAnswers?.map(ma => ma.value.sort()) || [];

      console.log("Expected Answers:", expectedAnswers);
      console.log("Given Answers:", givenAnswers);

      const flatExpected = expectedAnswers.flat().sort();
      const flatGiven = givenAnswers.flat().sort();

      console.log("Flattened Expected Answers:", flatExpected);
      console.log("Flattened Given Answers:", flatGiven);

      const isCorrect = JSON.stringify(flatExpected) === JSON.stringify(flatGiven);
      console.log("Is Correct?", isCorrect);

      return isCorrect;
    } else {
      return JSON.stringify(question.answers) === JSON.stringify(answer.selectedAnswer);
    }
  }
}
