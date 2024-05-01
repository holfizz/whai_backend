import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { InteractionInput, QuizInput } from "./dto/quiz.input";

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: QuizInput): Promise<any> {
    // Проверяем наличие interactions для типа MATCH и наоборот
    if (data.questionType === "MATCH" && (data.interactions?.length || !data.matchingInteraction)) {
      throw new Error("For MATCH type, only matchingInteraction is allowed and required, but other interactions are not allowed.");
    }

    if (data.questionType === "MATCH" && (!data.matchingInteraction.left.length || !data.matchingInteraction.right.length || !data.matchingInteraction.answers.length)) {
      throw new Error("Incomplete matchingInteraction data. Ensure left, right, and answers arrays are provided.");
    }

    return await this.prisma.$transaction(async prisma => {
      let createData = {
        title: data.title,
        questionType: data.questionType,
        stimulus: data.stimulus,
        prompt: data.prompt,
      };

      if (data.questionType === "MATCH") {
        const matchingInteraction = data.matchingInteraction;

        if (!Array.isArray(matchingInteraction.answers)) {
          throw new Error("Answers data is missing or not in the correct format.");
        }

        // Присваиваем ID элементам слева и справа
        const leftWithIds = matchingInteraction.left.map((item, index) => ({
          content: item.content,
          id: (index + 1).toString(),
        }));

        const rightWithIds = matchingInteraction.right.map((item, index) => ({
          content: item.content,
          id: String.fromCharCode(97 + index),
        }));

        // Теперь answers находятся внутри matchingInteraction
        const answersWithIds = matchingInteraction.answers.map(answerPair => {
          const leftItem = leftWithIds.find(item => item.content === answerPair[0]);
          const rightItem = rightWithIds.find(item => item.content === answerPair[1]);

          if (!leftItem || !rightItem) {
            throw new Error("Cannot find matching items for the provided answer pair.");
          }

          return [leftItem.id, rightItem.id];
        });

        createData["matchingInteraction"] = {
          create: {
            left: leftWithIds,
            right: rightWithIds,
            answers: answersWithIds,
          },
        };
      } else {
        createData["choices"] = {
          create: data.choices,
        };
      }

      const newQuiz = await prisma.quiz.create({
        data: createData,
        include: {
          matchingInteraction: true,
          choices: true,
        },
      });

      // Если это не MATCH и interactions предоставлены, создаем их
      if (data.questionType !== "MATCH" && data.interactions && data.interactions.length > 0) {
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

      return newQuiz;
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
