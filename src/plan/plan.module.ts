import { AuthService } from "@/auth/auth.service";
import { MailService } from "@/auth/mail.service";
import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { LessonBlockService } from "@/lesson-block/lesson-block.service";
import { LessonTasksService } from "@/lesson-tasks/lesson-tasks.service";
import { LessonModule } from "@/lesson/lesson.module";
import { LessonRepository } from "@/lesson/lesson.repository";
import { LessonService } from "@/lesson/lesson.service";
import { LessonUtils } from "@/lesson/lesson.utils";
import { PrismaService } from "@/prisma.service";
import { QuizRepository } from "@/quiz/quiz.repository";
import { QuizService } from "@/quiz/quiz.service";
import { QuizUtils } from "@/quiz/quiz.utils";
import { SubtopicModule } from "@/subtopic/subtopic.module";
import { SubtopicService } from "@/subtopic/subtopic.service";
import { TelegramService } from "@/telegram/telegram.service";
import { TopicModule } from "@/topic/topic.module";
import { TopicService } from "@/topic/topic.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PlanRepository } from "./plan.repository";
import { PlanResolver } from "./plan.resolver";
import { PlanService } from "./plan.service";
import { PlanUtils } from "./plan.utils";

@Module({
  providers: [
    PlanResolver,
    PlanService,
    PrismaService,
    PlanRepository,
    PlanUtils,
    EduAiService,
    LessonService,
    TopicService,
    SubtopicService,
    LessonRepository,
    LessonUtils,
    LessonBlockService,
    LessonTasksService,
    QuizService,
    QuizRepository,
    QuizUtils,
    TelegramService,
    AuthService,
    JwtService,
    MailService,
  ],
  imports: [EduAiModule, HttpModule, LessonModule, TopicModule, SubtopicModule],
})
export class PlanModule {}
