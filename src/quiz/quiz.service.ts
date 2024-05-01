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
  async findAllQuizzes(): Promise<any> {
    return await this.prisma.quiz.findMany({
      include: {
        choices: true,
        interactions: true,
        matchingInteraction: true,
      },
    });
  }

  async findQuizById(id: string): Promise<any> {
    return await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        choices: true,
        interactions: true,
        matchingInteraction: true,
      },
    });
  }

  async deleteQuiz(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        await prisma.choice.deleteMany({
          where: { quizId: id },
        });

        await prisma.interaction.deleteMany({
          where: { quizId: id },
        });

        await prisma.matchingInteraction.deleteMany({
          where: { quizId: id },
        });

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

      let updateData: any = {
        title: data.title,
        questionType: data.questionType,
        stimulus: data.stimulus,
        prompt: data.prompt,
      };

      const updatedQuiz = await prisma.quiz.update({
        where: { id },
        data: updateData,
      });

      if (data.questionType === "MATCH" && data.matchingInteraction) {
        if (!Array.isArray(data.matchingInteraction.left) || !Array.isArray(data.matchingInteraction.right) || !Array.isArray(data.matchingInteraction.answers)) {
          throw new Error("Incomplete matchingInteraction data for MATCH type.");
        }

        const existingMatchingInteraction = await prisma.matchingInteraction.findUnique({
          where: { quizId: id },
        });

        if (existingMatchingInteraction) {
          // Update the existing MatchingInteraction
          await prisma.matchingInteraction.update({
            where: { id: existingMatchingInteraction.id },
            data: {
              left: JSON.parse(JSON.stringify(data.matchingInteraction.left)),
              right: JSON.parse(JSON.stringify(data.matchingInteraction.right)),
              answers: data.matchingInteraction.answers,
            },
          });
        } else {
          // Create new MatchingInteraction if it doesn't exist
          await prisma.matchingInteraction.create({
            data: {
              quizId: id,
              left: JSON.parse(JSON.stringify(data.matchingInteraction.left)),
              right: JSON.parse(JSON.stringify(data.matchingInteraction.right)),
              answers: data.matchingInteraction.answers,
            },
          });
        }
      }

      return await prisma.quiz.findUnique({
        where: { id },
        include: {
          choices: true,
          interactions: true,
          matchingInteraction: true,
        },
      });
    });
  }
}
