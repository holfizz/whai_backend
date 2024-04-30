import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { InteractionInput, QuizInput } from "./dto/quiz.input";

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: QuizInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      const newQuiz = await prisma.quiz.create({
        data: {
          title: data.title,
          questionType: data.questionType,
          stimulus: data.stimulus,
          prompt: data.prompt,
          choices:
            data.questionType !== "MATCH"
              ? {
                  create: data.choices,
                }
              : undefined,
          MatchingInteraction:
            data.questionType === "MATCH"
              ? {
                  create: data.matchingInteraction
                    ? {
                        left: data.matchingInteraction.left,
                        right: data.matchingInteraction.right,
                        answers: data.matchingInteraction.answers,
                      }
                    : undefined,
                }
              : undefined,
        },
      });

      if (data.interactions && data.interactions.length > 0) {
        await Promise.all(
          data.interactions.map(async (interactionInput: InteractionInput) => {
            await prisma.interaction.create({
              data: {
                quizId: newQuiz.id,
                placeholder: interactionInput.placeholder,
                choices: {
                  create: interactionInput.choices.map(choice => ({ content: choice.content, quizId: newQuiz.id })),
                },
                answers: interactionInput.answers,
              },
            });
          }),
        );
      }

      // Возвращаем созданный Quiz с необходимыми связанными данными
      return prisma.quiz.findUnique({
        where: { id: newQuiz.id },
        include: {
          choices: true,
          interactions: {
            include: {
              choices: true,
            },
          },
          MatchingInteraction: true,
        },
      });
    });
  }

  // async findAllQuizzes() {
  //   return this.prisma.quiz.findMany({
  //     include: {
  //       choices: true,
  //       interactions: true,
  //       matchingInteraction: true,
  //     },
  //   });
  // }

  // async findQuizById(id: string) {
  //   return this.prisma.quiz.findUnique({
  //     where: { id },
  //     include: {
  //       choices: true,
  //       interactions: true,
  //       matchingInteraction: true,
  //     },
  //   });
  // }

  // async deleteQuiz(id: string) {
  //   return this.prisma.quiz.delete({
  //     where: { id },
  //   });
  // }

  // async updateQuiz(id: string, data: QuizInput) {
  //   return this.prisma.quiz.update({
  //     where: { id },
  //     data: {
  //       title: data.title,
  //       // Обновленные поля.
  //     },
  //     include: {
  //       choices: true,
  //       interactions: true,
  //       matchingInteraction: true,
  //     },
  //   });
  // }
}
