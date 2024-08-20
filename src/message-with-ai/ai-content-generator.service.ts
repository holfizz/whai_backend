import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { GenerateTDInput, KnowledgeSumInput } from "./dto/message-with-ai.input";

@Injectable()
export class ContentGeneratorService {
  constructor(
    private readonly eduAiService: EduAiService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTitleAndDescription(dto: GenerateTDInput, userId: string) {
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
}
