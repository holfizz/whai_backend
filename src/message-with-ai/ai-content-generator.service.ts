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
    if (user.additionalTitlesCount <= 0) {
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

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.conversationId, userId, aiDto, "EduAI");
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

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.conversationId, userId, aiDto, "EduAI");
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
          for (const item of parsedContent.blocks) {
            await this.prisma.subtopic.create({
              data: {
                name: item.title,
                description: item.description,
                topicId: newTopic.id,
                courseId: dto.courseId,
              },
            });
          }
        }
        return JSON.stringify(parsedContent, null, 2);
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
        return JSON.stringify(parsedContent, null, 2);
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
            isAutofill: dto.isAutofill,
          },
        };

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
        return JSON.stringify(parsedContent, null, 2);
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
            isAutofill: dto.isAutofill,
          },
        };

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
        return JSON.stringify(parsedContent, null, 2);
      }

      default:
        throw new Error("Invalid type specified.");
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
