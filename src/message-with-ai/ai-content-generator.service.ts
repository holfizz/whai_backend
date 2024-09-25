import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { BlockInput, GenerateTDInput, KnowledgeSumInput } from "./dto/message-with-ai.input";

@Injectable()
export class ContentGeneratorService {
  constructor(
    private readonly eduAiService: EduAiService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTitleAndDescription(dto: GenerateTDInput, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    const activeSubscription = await this.prisma.subscriptionHistory.findFirst({
      where: {
        userId,
        endedAt: { gte: new Date() },
      },
    });
    if (user.additionalTitlesCount <= 0 && !activeSubscription) {
      throw new Error("No additional titles available for generation.");
    }
    const aiDto: AIDTO = {
      content: {
        createType: "Заголовок",
        descriptionType: "Создай заголовки и описания для курса",
        userRequest: dto.userRequest,
        type: dto.type,
      },
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const tdJson = this.extractTDJson(fullContent);

    const parsedContent = JSON.parse(tdJson);
    logger.log("parsedContent", parsedContent);

    await this.prisma.user.update({
      where: { id: userId },
      data: { additionalTitlesCount: { decrement: 1 } },
    });

    return parsedContent;
  }

  private extractTDJson(content: string): string {
    const quizPattern = /```td([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let match = content.match(quizPattern);
    if (!match || match.length < 2) {
      console.error("Cannot find quiz block in the provided content.");
      throw new Error("Cannot find quiz block in the provided content.");
    }
    let tdContent = match[1].trim();
    let jsonMatch = tdContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      tdContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        tdContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(tdContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", tdContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return tdContent;
  }

  async generateKnowledgeSum(dto: KnowledgeSumInput, userId: string) {
    const userAnswers = await this.prisma.userAnswer.findMany({
      where: {
        quizResultId: dto.quizResultId,
      },
      include: {
        question: true,
      },
    });

    const quiz = userAnswers.map(answer => ({
      question: answer.question,
      answer: answer.correctAnswers,
      userAnswer: answer.question.questionType === "MATCH" ? answer.matchingAnswers : answer.selectedAnswers,
    }));
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    logger.log(quiz);
    const aiDto: AIDTO = {
      content: {
        createType: "knowledge_sum",
        createDescription: "Сделай вывод по знаниям пользователя",
        quiz: quiz,
        courseTitle: course.name,
        courseDescription: course.description,
      },
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const tdJson = this.extractKnowledgeSumJson(fullContent);

    const parsedContent = JSON.parse(tdJson);
    logger.log("parsedContent", parsedContent);

    return parsedContent;
  }

  private extractKnowledgeSumJson(content: string): string {
    const quizPattern = /```knowledge_sum([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let match = content.match(quizPattern);
    if (!match || match.length < 2) {
      console.error("Cannot find quiz block in the provided content.");
      throw new Error("Cannot find quiz block in the provided content.");
    }
    let knowledgeContent = match[1].trim();
    let jsonMatch = knowledgeContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      knowledgeContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        knowledgeContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(knowledgeContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", knowledgeContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return knowledgeContent;
  }
  async generateBlocks(dto: BlockInput, userId: string) {
    let relatedItems = [];
    let aiDto: AIDTO;

    // Fetch the current user to check their additionalTitlesCount
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { additionalTitlesCount: true },
    });

    if (!user) throw new Error("User not found.");

    // Initialize blocks count to zero
    let blocksCount = 0;

    switch (dto.type) {
      case "topic": {
        if (!dto.courseId) throw new Error("Course ID is required for topic.");

        const topics = await this.prisma.topic.findMany({
          where: { courseId: dto.courseId },
          select: { name: true, description: true },
        });

        relatedItems = topics.map(topic => ({
          title: topic.name,
          description: topic.description,
        }));

        aiDto = {
          content: {
            createType: "Блок",
            items: relatedItems,
            userRequest: dto.userRequest,
            type: "topic",
            isAutofill: dto.isAutofill,
          },
        };
        logger.log("AIDto", aiDto);
        logger.log("relatedItems", relatedItems);
        const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
        if (!fullContent) throw new Error("Failed to get content from AI service.");

        const tdJson = this.extractBlockJson(fullContent);
        const parsedContent = JSON.parse(tdJson);
        logger.log("parsedContent", parsedContent);
        const newTopic = await this.prisma.topic.create({
          data: {
            name: parsedContent.title,
            description: parsedContent.description,
            courseId: dto.courseId,
          },
        });

        // Create subtopics if blocks exist and isAutofill is true
        if (dto.isAutofill && parsedContent.blocks) {
          blocksCount = parsedContent.blocks.length; // Update blocksCount
          for (const item of parsedContent.blocks) {
            const newSubtopic = await this.prisma.subtopic.create({
              data: {
                name: item.title,
                description: item.description,
                topicId: newTopic.id,
                courseId: dto.courseId,
              },
            });

            // Create lessons inside subtopics if blocks exist within subtopics
            if (item.blocks && item.blocks.length > 0) {
              blocksCount += item.blocks.length; // Add sub-blocks to blocksCount
              for (const subItem of item.blocks) {
                await this.prisma.lesson.create({
                  data: {
                    name: subItem.title,
                    description: subItem.description,
                    courseId: dto.courseId,
                    subtopicId: newSubtopic.id,
                  },
                });
              }
            }
          }
        }
        break;
      }

      case "subtopic": {
        if (!dto.topicId) throw new Error("Topic ID is required for subtopic.");

        const subtopics = await this.prisma.subtopic.findMany({
          where: { topicId: dto.topicId },
          select: { name: true, description: true },
        });

        relatedItems = subtopics.map(subtopic => ({
          title: subtopic.name,
          description: subtopic.description,
        }));

        aiDto = {
          content: {
            createType: "Блок",
            items: relatedItems,
            userRequest: dto.userRequest,
            type: dto.type,
            isAutofill: dto.isAutofill,
          },
        };
        logger.log(aiDto);

        // Call the AI service
        const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
        if (!fullContent) throw new Error("Failed to get content from AI service.");

        // Extract and process the JSON content
        const tdJson = this.extractBlockJson(fullContent);
        const parsedContent = JSON.parse(tdJson);
        logger.log("parsedContent", parsedContent);

        // Create subtopic
        const newSubtopic = await this.prisma.subtopic.create({
          data: {
            name: parsedContent.title,
            description: parsedContent.description,
            topicId: dto.topicId,
            courseId: dto.courseId,
          },
        });

        // Create lessons if blocks exist and isAutofill is true
        if (dto.isAutofill && parsedContent.blocks) {
          blocksCount = parsedContent.blocks.length; // Update blocksCount
          for (const item of parsedContent.blocks) {
            await this.prisma.lesson.create({
              data: {
                name: item.title,
                description: item.description,
                courseId: dto.courseId,
                subtopicId: newSubtopic.id,
              },
            });
          }
        }
        break;
      }

      case "lesson": {
        if (!dto.subtopicId) throw new Error("Subtopic ID is required for lessons.");

        // Fetch lessons by subtopicId
        const lessons = await this.prisma.lesson.findMany({
          where: { subtopicId: dto.subtopicId },
          select: { name: true, description: true },
        });

        relatedItems = lessons.map(lesson => ({
          title: lesson.name,
          description: lesson.description,
        }));

        aiDto = {
          content: {
            createType: "Блок",
            items: relatedItems,
            userRequest: dto.userRequest,
            type: dto.type,
            isAutofill: false,
          },
        };
        logger.log(aiDto);

        // Call the AI service
        const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
        if (!fullContent) throw new Error("Failed to get content from AI service.");

        // Extract and process the JSON content
        const tdJson = this.extractBlockJson(fullContent);
        const parsedContent = JSON.parse(tdJson);
        logger.log("parsedContent", parsedContent);

        // Create lesson
        await this.prisma.lesson.create({
          data: {
            name: parsedContent.title,
            description: parsedContent.description,
            courseId: dto.courseId,
            subtopicId: dto.subtopicId,
          },
        });

        // Decrement additionalTitlesCount by 1 for lessons
        blocksCount = 1; // For lessons, always decrement by 1
        break;
      }

      case "quiz": {
        if (!dto.subtopicId) throw new Error("Subtopic ID is required for quizzes.");

        // Fetch quizzes by subtopicId
        const quizzes = await this.prisma.quiz.findMany({
          where: { subtopicId: dto.subtopicId },
          select: { name: true, description: true },
        });

        relatedItems = quizzes.map(quiz => ({
          title: quiz.name,
          description: quiz.description,
        }));

        aiDto = {
          content: {
            createType: "Блок",
            items: relatedItems,
            userRequest: dto.userRequest,
            type: dto.type,
            isAutofill: false,
          },
        };
        logger.log(aiDto);
        // Call the AI service
        const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI");
        if (!fullContent) throw new Error("Failed to get content from AI service.");

        const tdJson = this.extractBlockJson(fullContent);
        const parsedContent = JSON.parse(tdJson);
        logger.log("parsedContent", parsedContent);

        await this.prisma.quiz.create({
          data: {
            name: parsedContent.title,
            description: parsedContent.description,
            courseId: dto.courseId,
            subtopicId: dto.subtopicId,
          },
        });

        // Decrement additionalTitlesCount by 1 for quizzes
        blocksCount = 1; // For quizzes, always decrement by 1
        break;
      }

      default:
        throw new Error("Invalid type specified.");
    }

    // Decrement additionalTitlesCount by the number of blocks after successful generation
    if (dto.isAutofill && blocksCount > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { additionalTitlesCount: user.additionalTitlesCount - blocksCount },
      });
    }

    return "true";
  }

  private extractBlockJson(content: string): string {
    const quizPattern = /```block([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let match = content.match(quizPattern);
    if (!match || match.length < 2) {
      console.error("Cannot find blocks in the provided content.");
      throw new Error("Cannot find blocks in the provided content.");
    }
    let blockContent = match[1].trim();
    let jsonMatch = blockContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      blockContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        blockContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(blockContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", blockContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return blockContent;
  }
}
