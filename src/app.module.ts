import { CourseAIHistoryModule } from "@/couse-ai-history/course_ai_history.module";
import { SubtopicModule } from "@/subtopic/subtopic.module";
import { TopicModule } from "@/topic/topic.module";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { JwtStrategy } from "./auth/jwt.strategy";
import { ChatMembersModule } from "./chat-members/chat-members.module";
import { ChatWIthAIModule } from "./chat-with-ai/chat-with-ai.module";
import { ChatModule } from "./chat/chat.module";
import { CourseModule } from "./course/course.module";
import { EduAiModule } from "./edu-ai/edu-ai.module";
import { FileModule } from "./file/file.module";
import { LessonBlockModule } from "./lesson-block/lesson-block.module";
import { LessonTasksModule } from "./lesson-tasks/lesson-tasks.module";
import { LessonModule } from "./lesson/lesson.module";
import { MessageWithAiModule } from "./message-with-ai/message-with-ai.module";
import { MessageModule } from "./message/message.module";
import { NoticeModule } from "./notice/notice.module";
import { PaginationModule } from "./pagination/pagination.module";
import { PlanModule } from "./plan/plan.module";
import { PrismaService } from "./prisma.service";
import { QuizModule } from "./quiz/quiz.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "src/schema.gql",
      installSubscriptionHandlers: true,
      sortSchema: true,
      useGlobalPrefix: true,
      subscriptions: {
        "graphql-ws": true,
        "subscriptions-transport-ws": true,
      },

      playground:
        process.env.NODE_ENV !== "production"
          ? {
              settings: {
                "request.credentials": "include",
              },
            }
          : false,
      context: ({ req, res }) => ({ req, res }),
    }),

    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "../static"),
    }),
    AuthModule,
    UserModule,
    FileModule,
    ChatModule,
    MessageModule,
    ChatWIthAIModule,
    ChatMembersModule,
    PaginationModule,
    CourseModule,
    LessonModule,
    QuizModule,
    LessonBlockModule,
    LessonTasksModule,
    SubtopicModule,
    TopicModule,
    MessageWithAiModule,
    AnalyticsModule,
    NoticeModule,
    // TelegramModule,
    EduAiModule,
    PlanModule,
    CourseAIHistoryModule,
    SubscriptionModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: JwtStrategy }],
})
export class AppModule {}
