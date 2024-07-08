import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlanRepository } from "./plan.repository";
import { PlanResolver } from "./plan.resolver";
import { PlanService } from "./plan.service";
import { PlanUtils } from "./plan.utils";
import { LessonModule } from "@/lesson/lesson.module";
import { TopicModule } from "@/topic/topic.module";
import { SubtopicModule } from "@/subtopic/subtopic.module";
import { LessonService } from "@/lesson/lesson.service";
import { TopicService } from "@/topic/topic.service";
import { SubtopicService } from "@/subtopic/subtopic.service";
import { LessonRepository } from "@/lesson/lesson.repository";
import { LessonUtils } from "@/lesson/lesson.utils";
import { LessonBlockService } from "@/lesson-block/lesson-block.service";
import { LessonTasksService } from "@/lesson-tasks/lesson-tasks.service";
import { QuizService } from "@/quiz/quiz.service";
import { QuizRepository } from "@/quiz/quiz.repository";
import { QuizUtils } from "@/quiz/quiz.utils";

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
  ],
  imports: [EduAiModule, HttpModule, LessonModule, TopicModule, SubtopicModule],
})
export class PlanModule {}
