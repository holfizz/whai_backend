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
    if (data.questionType === "MATCH" && (data.interactions?.length || !data.matchingInteraction)) {
      throw new Error("For MATCH type, only matchingInteraction is allowed and required, but other interactions are not allowed.");
    }

    if (data.questionType === "MATCH" && (!data.matchingInteraction.left.length || !data.matchingInteraction.right.length || !data.matchingInteraction.answers.length)) {
      throw new Error("Incomplete matchingInteraction data. Ensure left, right, and answers arrays are provided.");
    }

    return await this.prisma.$transaction(async prisma => {
      let createData: any = {
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

        const leftWithIds = matchingInteraction.left.map((item, index) => ({
          content: item.content,
          id: (index + 1).toString(),
        }));

        const rightWithIds = matchingInteraction.right.map((item, index) => ({
          content: item.content,
          id: String.fromCharCode(97 + index),
        }));

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
          create: data.choices.map(choice => ({
            content: choice.content,
          })),
        };
      }

      const newQuiz = await prisma.quiz.create({
        data: createData,
        include: {
          matchingInteraction: true,
          choices: true,
          interactions: true,
        },
      });

      if (data.questionType !== "MATCH" && data.interactions && data.interactions.length > 0) {
        for (const interactionInput of data.interactions) {
          const createdInteraction = await prisma.interaction.create({
            data: {
              quiz: { connect: { id: newQuiz.id } },
              answers: interactionInput.answers,
            },
          });

          for (const choice of interactionInput.choices) {
            await prisma.choice.create({
              data: {
                content: choice.content,
                interaction: { connect: { id: createdInteraction.id } },
                quiz: { connect: { id: newQuiz.id } },
              },
            });
          }
        }
      }

      const finalQuiz = await prisma.quiz.findUnique({
        where: { id: newQuiz.id },
        include: {
          matchingInteraction: true,
          choices: true,
          interactions: {
            include: {
              choices: true,
            },
          },
        },
      });

      return finalQuiz;
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

  async createQuizWithAI(userId: string, dto: QuizWithAIInput, pubSub: PubSub): Promise<any> {
    const { content, folderId, lessonBlockId, chatWithAIId } = dto;

    // Check if the chatWithAIId exists
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

    const fullContent = (await this.eduAiService
      .getAIModelAnswer(chatWithAIId, userId, { content, messagesHistory }, "EduAI", pubSub)
      .then(async fullContent => {
        if (fullContent.length > 0) {
          try {
            console.log(fullContent);
            const messageWithAI = await this.prisma.messageWithAI.create({
              data: {
                content: fullContent,
                chatWithAIId: chatWithAIId,
                role: MessageWithAIRole.ASSISTANT,
              },
            });
            return messageWithAI;
          } catch (prismaError) {
            throw prismaError;
          }
        } else {
          return [];
        }
      })
      .catch(error => {
        console.error("Error: ", error);
        throw error;
      })) as any;

    try {
      const match = fullContent.match(/```quiz\n(.*?)\n```/s);
      console.log("quiz json: ", match);
      if (!match || match.length < 2) {
        throw new Error("Cannot find quiz JSON in the provided content.");
      }
      const quizJson = match[1];

      const parsedContent = JSON.parse(quizJson);

      const quizzes = parsedContent.quizzes;

      for (const quiz of quizzes) {
        const questions = quiz.questions.map(question => ({
          questionType: question.questionType,
          stimulus: question.stimulus,
          choices: question.choices.map(choice => ({
            content: choice.content,
            correctAnswerDescription: choice.correctAnswerDescription,
            incorrectAnswerDescription: choice.incorrectAnswerDescription,
          })),
          answers: question.answers,
        }));

        const quizInput: QuizInput = {
          title: quizzes.title,
          questionType: quiz.questionType,
          stimulus: quiz.stimulus,
          prompt: quiz.prompt,
          choices: questions.flatMap(q => q.choices),
          answers: questions.flatMap(q => q.answers),
          lessonBlockId,
          folderId,
        };

        await this.createQuiz(quizInput);
      }

      return quizzes;
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
}
