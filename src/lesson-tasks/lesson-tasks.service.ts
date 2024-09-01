import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { TelegramService } from "@/telegram/telegram.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { FileUpload } from "graphql-upload-ts";
import { CheckHomeworkDto, LessonTasksInput } from "./dto/lesson-task.input";
import { UpdateLessonTasks } from "./dto/update-lesson-task.input";

@Injectable()
export class LessonTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eduAiService: EduAiService,
    private readonly telegramService: TelegramService,
  ) {}
  async createLessonTask(data: LessonTasksInput) {
    return this.prisma.lessonTask.create({
      data: {
        name: data.name,
        description: data.description,
        lessonId: data.lessonId,
      },
    });
  }
  async updateLessonTask(id: string, data: UpdateLessonTasks) {
    const lesson = await this.prisma.lessonTask.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return this.prisma.lessonTask.update({ where: { id }, data });
  }

  async deleteLessonTask(id: string) {
    const lesson = await this.prisma.lessonTask.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    await this.prisma.lessonTask.deleteMany({ where: { id } });
  }

  async getAllTasksByLessonId(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    return await this.prisma.lessonTask.findMany({ where: { lessonId } });
  }

  async checkHomework(dto: CheckHomeworkDto, uploadedFile: FileUpload, pubSub: PubSub, userId: string) {
    const lessonTask = await this.prisma.lessonTask.findUnique({ where: { id: dto.lessonTaskId } });
    if (!lessonTask) {
      throw new NotFoundException(`Lesson with ID ${dto.lessonTaskId} not found`);
    }

    // Отправляем файл и получаем ссылку
    const fileUrl = await this.telegramService.sendFileAndGetMessageUrl(uploadedFile, "photo");
    console.log("URL сообщения с файлом:", fileUrl);

    const aiDto: AIDTO = {
      content: {
        createType: "Homework",
        taskName: lessonTask.name,
        taskDescription: lessonTask.description,
        file: fileUrl,
      },
    };

    logger.log("aiDto", aiDto);
    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const lessonTaskJson = this.extractLessonTaskJson(fullContent);
    const parsedContent = JSON.parse(lessonTaskJson);
    logger.log("parsedContent", parsedContent);
  }

  private extractLessonTaskJson(content: string): string {
    const lessonPattern = /```homework([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let lessonMatch = content.match(lessonPattern);
    if (!lessonMatch || lessonMatch.length < 2) {
      console.error("Cannot find lesson task block in the provided content.");
      throw new Error("Cannot find lesson task block in the provided content.");
    }
    let lessonContent = lessonMatch[1].trim();
    let jsonMatch = lessonContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      lessonContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        lessonContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(lessonContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", lessonContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return lessonContent;
  }
}
