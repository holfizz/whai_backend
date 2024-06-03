import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageWithAIRole } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput } from "./dto/quiz.input";

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private readonly eduAiService: EduAiService,
  ) {}

  async createQuiz(data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      // Убедимся, что folderId существует, если он передан
      if (data.folderId) {
        const folder = await prisma.folder.findUnique({
          where: { id: data.folderId },
        });
        if (!folder) {
          throw new Error(`Folder with id ${data.folderId} does not exist.`);
        }
      }

      // Убедимся, что lessonBlockId существует, если он передан
      if (data.lessonBlockId) {
        const lessonBlock = await prisma.lessonBlock.findUnique({
          where: { id: data.lessonBlockId },
        });
        if (!lessonBlock) {
          throw new Error(`LessonBlock with id ${data.lessonBlockId} does not exist.`);
        }
      }

      // Создаем новую запись викторины
      const newQuiz = await prisma.quiz.create({
        data: {
          title: data.title,
          lessonBlockId: data.lessonBlockId || null, // Допускаем null, если не передано
          folderId: data.folderId || null, // Допускаем null, если не передано
        },
      });

      const quizId = newQuiz.id;

      for (const question of data.questions) {
        // Создаем новую запись вопроса
        const createdQuestion = await prisma.question.create({
          data: {
            questionType: question.questionType,
            stimulus: question.stimulus,
            prompt: question.prompt,
            answers: question.answers,
            quiz: { connect: { id: quizId } },
          },
        });

        const questionId = createdQuestion.id;

        if (question.questionType === "MATCH") {
          await prisma.matchingInteraction.create({
            data: {
              left: question.matchingInteraction.left.map(item => ({
                content: item.content,
              })),
              right: question.matchingInteraction.right.map(item => ({
                content: item.content,
              })),
              answers: question.matchingInteraction.answers,
              question: { connect: { id: questionId } },
            },
          });
        } else {
          // Создаем варианты ответа, если они есть
          if (question.choices) {
            for (const choice of question.choices) {
              await prisma.choice.create({
                data: {
                  content: choice.content,
                  correctAnswerDescription: choice.correctAnswerDescription,
                  incorrectAnswerDescription: choice.incorrectAnswerDescription,
                  question: { connect: { id: questionId } },
                },
              });
            }
          }

          // Создаем interactions, если они есть
          if (question.interactions && question.interactions.length > 0) {
            for (const interaction of question.interactions) {
              const createdInteraction = await prisma.interaction.create({
                data: {
                  answers: interaction.answers,
                  question: { connect: { id: questionId } },
                },
              });

              for (const choice of interaction.choices) {
                await prisma.choice.create({
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
      }

      return await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              choices: true,
              interactions: true,
              matchingInteraction: true,
            },
          },
        },
      });
    });
  }

  async findAllQuizzes(): Promise<any> {
    return await this.prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            choices: true,
            interactions: true,
            matchingInteraction: true,
          },
        },
      },
    });
  }

  async findQuizById(id: string): Promise<any> {
    return await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            choices: true,
            interactions: true,
            matchingInteraction: true,
          },
        },
      },
    });
  }

  async deleteQuiz(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        const questions = await prisma.question.findMany({
          where: { quizId: id },
        });

        for (const question of questions) {
          await prisma.choice.deleteMany({
            where: { questionId: question.id },
          });

          await prisma.interaction.deleteMany({
            where: { questionId: question.id },
          });

          await prisma.matchingInteraction.deleteMany({
            where: { questionId: question.id },
          });

          await prisma.question.delete({
            where: { id: question.id },
          });
        }

        return await prisma.quiz.delete({
          where: { id },
        });
      })
      .catch(error => {
        throw new Error(`Failed to delete quiz and its related entities: ${error.message}`);
      });
  }

  async updateQuiz(id: string, data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { id },
      });

      if (!existingQuiz) {
        throw new Error("Quiz not found.");
      }

      const updatedQuiz = await prisma.quiz.update({
        where: { id },
        data: {
          title: data.title,
          lessonBlockId: data.lessonBlockId,
          folderId: data.folderId,
        },
      });

      const existingQuestions = await prisma.question.findMany({
        where: { quizId: id },
      });

      for (const question of existingQuestions) {
        await prisma.choice.deleteMany({
          where: { questionId: question.id },
        });

        await prisma.interaction.deleteMany({
          where: { questionId: question.id },
        });

        await prisma.matchingInteraction.deleteMany({
          where: { questionId: question.id },
        });

        await prisma.question.delete({
          where: { id: question.id },
        });
      }

      for (const question of data.questions) {
        const newQuestion = await prisma.question.create({
          data: {
            questionType: question.questionType,
            stimulus: question.stimulus,
            prompt: question.prompt,
            answers: question.answers,
            quiz: { connect: { id: updatedQuiz.id } },
          },
        });

        if (question.questionType === "MATCH") {
          await prisma.matchingInteraction.create({
            data: {
              left: [JSON.stringify(question.matchingInteraction.left)],
              right: [JSON.stringify(question.matchingInteraction.right)],
              answers: question.matchingInteraction.answers,
              question: { connect: { id: newQuestion.id } },
            },
          });
        } else {
          await prisma.choice.createMany({
            data: question.choices.map(choice => ({
              content: choice.content,
              questionId: newQuestion.id,
            })),
          });

          if (question.interactions && question.interactions.length > 0) {
            for (const interactionInput of question.interactions) {
              const createdInteraction = await prisma.interaction.create({
                data: {
                  answers: interactionInput.answers,
                  question: { connect: { id: newQuestion.id } },
                },
              });

              for (const choice of interactionInput.choices) {
                await prisma.choice.create({
                  data: {
                    content: choice.content,
                    interaction: { connect: { id: createdInteraction.id } },
                    question: { connect: { id: newQuestion.id } },
                  },
                });
              }
            }
          }
        }
      }

      return await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            include: {
              choices: true,
              interactions: true,
              matchingInteraction: true,
            },
          },
        },
      });
    });
  }
  async createQuizWithAI(userId: string, dto: QuizWithAIInput, pubSub: PubSub): Promise<any> {
    const { content, folderId, lessonBlockId, chatWithAIId } = dto;
    const chatWithAI = await this.prisma.chatWithAI.findUnique({
      where: { id: chatWithAIId },
    });

    if (!chatWithAI) {
      throw new Error(`Chat with AI ID ${chatWithAIId} does not exist.`);
    }

    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId },
      orderBy: { createdAt: "asc" },
    });

    const fullContent = await this.eduAiService
      .getAIModelAnswer(chatWithAIId, userId, { content, messagesHistory }, "EduAI", pubSub)
      .then(async content => {
        if (content.length > 0) {
          try {
            console.log(content);
            const messageWithAI = await this.prisma.messageWithAI.create({
              data: {
                content: content,
                chatWithAIId: chatWithAIId,
                role: MessageWithAIRole.ASSISTANT,
              },
            });
            return content; // Возвращаем полное содержимое, а не созданное сообщение
          } catch (prismaError) {
            throw prismaError;
          }
        } else {
          return null;
        }
      })
      .catch(error => {
        console.error("Error: ", error);
        throw error;
      });

    if (!fullContent) {
      throw new Error("Failed to get content from AI service.");
    }

    try {
      // Проверка на наличие folderId и создание, если он не существует
      if (folderId) {
        const folder = await this.prisma.folder.findUnique({
          where: { id: folderId },
        });
        if (!folder) {
          throw new Error(`Folder with id ${folderId} does not exist.`);
        }
      }

      // Используем регулярное выражение для извлечения JSON
      const match = fullContent.match(/```quiz\n([\s\S]*?)\n```/);
      console.log("quiz json: ", match);
      if (!match || match.length < 2) {
        throw new Error("Cannot find quiz JSON in the provided content.");
      }
      const quizJson = match[1];

      const parsedContent = JSON.parse(quizJson);

      const { title, questions } = parsedContent;

      // Создаем запись викторины, чтобы получить ее id
      const createdQuiz = await this.prisma.quiz.create({
        data: {
          title: title,
          lessonBlockId: lessonBlockId,
          folderId: folderId || null,
        },
      });

      const quizId = createdQuiz.id;

      for (const question of questions) {
        const createdQuestion = await this.prisma.question.create({
          data: {
            questionType: question.questionType,
            stimulus: question.stimulus,
            prompt: question.prompt,
            answers: question.answers,
            quiz: { connect: { id: quizId } },
          },
        });

        const questionId = createdQuestion.id;

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

        if (question.questionType === "MATCH") {
          await this.prisma.matchingInteraction.create({
            data: {
              left: question.matchingInteraction.left,
              right: question.matchingInteraction.right,
              answers: question.matchingInteraction.answers,
              question: { connect: { id: questionId } },
            },
          });
        } else if (question.interactions && question.interactions.length > 0) {
          for (const interaction of question.interactions) {
            const createdInteraction = await this.prisma.interaction.create({
              data: {
                answers: interaction.answers,
                question: { connect: { id: questionId } },
              },
            });

            for (const choice of interaction.choices) {
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

      return parsedContent;
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
}
