import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
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
        descriptionType: "Создай заголовки и описания",
        userRequest: dto.userRequest,
      },
    };
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.conversationId, userId, aiDto, "EduAI");
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const tdJson = this.extractTDJson(fullContent);

    const parsedContent = JSON.parse(tdJson);
    console.log("parsedContent", parsedContent);

    return parsedContent;
  }

  private extractTDJson(content: string): string {
    const patterns = [/```td\n```json\n([\s\S]*?)\n```\n```/, /```json\n```td\n([\s\S]*?)\n```\n```/, /```td\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find TD JSON in the provided content.");
    }
    let tdJson = match[1];
    console.log(tdJson);
    if (tdJson.trim().startsWith("json")) {
      tdJson = tdJson.replace(/^json\s*/, "");
    }
    console.log(tdJson);
    try {
      JSON.parse(tdJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return tdJson;
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
    console.log(quiz);
    const aiDto: AIDTO = {
      content: {
        createType: "knowledge_sum",
        descriptionType: "Сделай вывод по знаниям пользователя",
        quiz: quiz,
        courseTitle: course.name,
        courseDescription: course.description,
      },
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.conversationId, userId, aiDto, "EduAI");
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const tdJson = this.extractKnowledgeSumJson(fullContent);

    const parsedContent = JSON.parse(tdJson);
    console.log("parsedContent", parsedContent);

    return parsedContent;
  }

  private extractKnowledgeSumJson(content: string): string {
    const patterns = [
      /```knowledge_sum\n```json\n([\s\S]*?)\n```\n```/,
      /```json\n```knowledge_sum\n([\s\S]*?)\n```\n```/,
      /```knowledge_sum\n([\s\S]*?)\n```/,
      /```json\n([\s\S]*?)\n```/,
    ];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find TD JSON in the provided content.");
    }
    let knowledgeSumJson = match[1];
    console.log(knowledgeSumJson);
    if (knowledgeSumJson.trim().startsWith("json")) {
      knowledgeSumJson = knowledgeSumJson.replace(/^json\s*/, "");
    }
    console.log(knowledgeSumJson);
    try {
      JSON.parse(knowledgeSumJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return knowledgeSumJson;
  }
}
