import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { QuestionInput, QuizInput } from "./dto/quiz.input";

@Injectable()
export class QuizRepository {
  constructor(private prisma: PrismaService) {}

  async validateFolderAndLesson(data: QuizInput): Promise<void> {
    if (data.folderId) {
      const folder = await this.prisma.folder.findUnique({ where: { id: data.folderId } });
      if (!folder) throw new Error(`Folder with id ${data.folderId} does not exist.`);
    }
    if (data.lessonBlockId) {
      const lessonBlock = await this.prisma.lessonBlock.findUnique({ where: { id: data.lessonBlockId } });
      if (!lessonBlock) throw new Error(`LessonBlock with id ${data.lessonBlockId} does not exist.`);
    }
  }

  async createQuiz(data: QuizInput): Promise<any> {
    return this.prisma.quiz.create({
      data: {
        title: data.title,
        lessonBlockId: data.lessonBlockId || null,
        folderId: data.folderId || null,
      },
    });
  }

  async createQuestion(question: QuestionInput, quizId: string): Promise<any> {
    const createdQuestion = await this.prisma.question.create({
      data: {
        questionType: question.questionType,
        stimulus: question.stimulus,
        prompt: question.prompt,
        answers: question.answers,
        quiz: { connect: { id: quizId } },
      },
    });

    if (question.questionType === "MATCH") {
      await this.createMatchingInteraction(question, createdQuestion.id);
    } else {
      await this.createChoicesAndInteractions(question, createdQuestion.id);
    }

    return createdQuestion;
  }

  async createMatchingInteraction(question: QuestionInput, questionId: string): Promise<void> {
    await this.prisma.matchingInteraction.create({
      data: {
        left: JSON.parse(JSON.stringify(question.matchingInteraction.left)),
        right: JSON.parse(JSON.stringify(question.matchingInteraction.right)),
        answers: question.matchingInteraction.answers,
        question: { connect: { id: questionId } },
      },
    });
  }

  async createChoicesAndInteractions(question: QuestionInput, questionId: string): Promise<void> {
    if (question.choices) {
      for (const choice of question.choices) {
        await this.prisma.choice.create({
          data: {
            content: choice.content,
            correctAnswerDescription: choice.correctAnswerDescription,
            incorrectAnswerDescription: choice.incorrectAnswerDescription,
            question: { connect: { id: questionId } },
          },
        });
      }
    }
    if (question.interactions) {
      for (const interaction of question.interactions) {
        const createdInteraction = await this.prisma.interaction.create({
          data: {
            answers: interaction.answers,
            question: { connect: { id: questionId } },
          },
        });
        for (const choice of interaction.choices || []) {
          await this.prisma.choice.create({
            data: {
              content: choice.content,
              interaction: { connect: { id: createdInteraction.id } },
              question: { connect: { id: questionId } },
            },
          });
        }
      }
    }
  }

  async updateQuizStats(quizId: string, stats: { totalQuestions: number }): Promise<void> {
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { totalQuestions: stats.totalQuestions },
    });
  }

  async findQuizById(quizId: string): Promise<any> {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true,
            interactions: {
              include: {
                choices: true, // Убедитесь, что взаимодействия всегда включают choices
              },
            },
            matchingInteraction: true,
          },
        },
      },
    });
  }

  async findAllQuizzes(): Promise<any> {
    return this.prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            choices: true,
            interactions: {
              include: {
                choices: true, // Убедитесь, что взаимодействия всегда включают choices
              },
            },
            matchingInteraction: true,
          },
        },
      },
    });
  }

  async deleteQuizAndRelatedEntities(quizId: string): Promise<void> {
    const questions = await this.prisma.question.findMany({ where: { quizId } });
    for (const question of questions) {
      await this.prisma.choice.deleteMany({ where: { questionId: question.id } });
      await this.prisma.interaction.deleteMany({ where: { questionId: question.id } });
      await this.prisma.matchingInteraction.deleteMany({ where: { questionId: question.id } });
      await this.prisma.question.delete({ where: { id: question.id } });
    }
    await this.prisma.quiz.delete({ where: { id: quizId } });
  }

  async updateQuiz(id: string, data: QuizInput): Promise<any> {
    const existingQuiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existingQuiz) throw new Error("Quiz not found.");

    await this.prisma.quiz.update({
      where: { id },
      data: {
        title: data.title,
        lessonBlockId: data.lessonBlockId || null,
        folderId: data.folderId || null,
      },
    });

    const existingQuestions = await this.prisma.question.findMany({ where: { quizId: id } });
    for (const question of existingQuestions) {
      await this.prisma.choice.deleteMany({ where: { questionId: question.id } });
      await this.prisma.interaction.deleteMany({ where: { questionId: question.id } });
      await this.prisma.matchingInteraction.deleteMany({ where: { questionId: question.id } });
      await this.prisma.question.delete({ where: { id: question.id } });
    }

    for (const question of data.questions) {
      await this.createQuestion(question, id);
    }
  }
}
