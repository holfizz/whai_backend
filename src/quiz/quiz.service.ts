import { EduAiService } from "@/edu-ai/edu-ai.service";
import { MessageWithAIInput } from "@/message-with-ai/dto/message-with-ai.input";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { InteractionInput, QuizInput } from "./dto/quiz.input";
@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private readonly eduAiService: EduAiService,
  ) {}

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
  async createQuizWithAI(userId: string, dto: MessageWithAIInput, pubSub: PubSub) {
    // Получаем историю сообщений
    let response;
    const { content, chatWithAIId } = dto;
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId },
      orderBy: { createdAt: "asc" },
    });

    const fullContent = (await this.eduAiService
      .getAIModelAnswer(chatWithAIId, userId, { messagesHistory, content }, "EduAI", pubSub)
      .then(async fullContent => {
        if (fullContent.length > 0) {
          try {
            console.log(fullContent);
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
    // const fullContent =
    //   '```quiz\n{\n  "title": "Основы программирования на Python",\n  "quizzes": [\n    {\n      "title": "Основы программирования на Python",\n      "questionType": "MCQ",\n      "stimulus": "Введ��те название теста",\n      "prompt": "Укаж��те тип вопроса (MCQ, MRQ, OEQ, NRQ, CLOZE, MATCH)",\n      "questions": [\n        {\n          "questionType": "MCQ",\n          "stimulus": "Что такое переменная в Python?",\n          "choices": [\n            {\n              "content": "Место ��ля хранения информации",\n              "correctAnswerDescription": "Правильный ответ. Переменная используется для хранения данных."\n            },\n            {\n              "content": "Функц��я для выполнения кода",\n              "incorrectAnswerDescription": "Неправильный отв��т. Функция используется для выполнения определенного кода."\n            },\n            {\n              "content": "Модуль для ��мпорта библиотек",\n              "incorrectAnswerDescription": "Неправил��ный ответ. Модуль используется для организации кода и импорта библиотек."\n            }\n          ],\n          "answers": ["Место дл�� хранения информации"]\n        },\n        {\n          "questionType": "MCQ",\n          "stimulus": "Какая фун��ция используется для вывода информации на экран в Python?",\n          "choices": [\n            {\n              "content": "input()",\n              "incorrectAnswerDescription": "Неправил��ный ответ. Функци�� input() испол��зуется для получения данных от пользователя."\n            },\n            {\n              "content": "print()",\n              "correctAnswerDescription": "Правильный ответ. Функция print() используется для вывода данных на экран."\n            },\n            {\n              "content": "len()",\n              "incorrectAnswerDescription": "Неправил��ный ответ. Функци�� len() испол��зуется для определения длины объекта."\n            }\n          ],\n          "answers": ["print()"]\n        },\n        {\n          "questionType": "MCQ",\n          "stimulus": "��ак обозна��ается начало комментария в Python?",\n          "choices": [\n            {\n              "content": "//",\n              "incorrectAnswerDescription": "Неправильн��й ответ. В Python комментарии начинаются с #."\n            },\n            {\n              "content": "#",\n              "correctAnswerDescription": "Правильный ответ. Коммен��арии в Python нач��наются с #."\n            },\n            {\n              "content": "/*",\n              "incorrectAnswerDescription": "Неправил��ный ответ. Такой синтаксис исполь��уется в других языках програ��мирования, таких как C."\n            }\n          ],\n          "answers": ["#"]\n        },\n        {\n          "questionType": "MCQ",\n          "stimulus": "Како�� тип данных ��редстален в Python?",\n          "choices": [\n            {\n              "content": "int",\n              "correctAnswerDescription": "Прав��льный ответ. int - это целочисленный тип данных �� Python."\n            },\n            {\n              "content": "char",\n              "incorrectAnswerDescription": "Непр��вильный ответ. В Python нет отдельного типа char, вме��то него используются строки (str)."\n            },\n            {\n              "content": "byte",\n              "incorrectAnswerDescription": "Неправильн��й ответ. В Python есть тип данных bytes, но не byte."\n            }\n          ],\n          "answers": ["int"]\n        }\n      ]\n    }\n  ]\n}\n```';
    if (fullContent.length > 0) {
      try {
        // Извлекаем текст внутри ```quiz {json}```
        const match = fullContent.match(/```quiz\n(.*?)\n```/s);
        console.log("quiz json: ", match);
        if (!match || match.length < 2) {
          throw new Error("Cannot find quiz JSON in the provided content.");
        }
        const quizJson = match[1];

        // Парсим JSON
        const parsedContent = JSON.parse(quizJson);

        const quizzes = parsedContent.quizzes;

        // Сохраняем каждый тест
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
            title: quiz.title,
            questionType: quiz.questionType,
            stimulus: quiz.stimulus,
            prompt: quiz.prompt,
            choices: questions.flatMap(q => q.choices),
            answers: questions.flatMap(q => q.answers),
          };

          response = await this.createQuiz(quizInput);
        }

        return response;
      } catch (error) {
        console.error("Error: ", error);
        throw error;
      }
    } else {
      return [];
    }
  }
}
