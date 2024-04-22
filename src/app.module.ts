import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { AuthModule } from "./auth/auth.module";
import { JwtStrategy } from "./auth/jwt.strategy";
import { ChatMembersModule } from "./chat-members/chat-members.module";
import { ChatWIthAIModule } from "./chat-with-ai/chat-with-ai.module";
import { ChatModule } from "./chat/chat.module";
import { FileModule } from "./file/file.module";
import { MessageModule } from "./message/message.module";
import { PaginationModule } from "./pagination/pagination.module";
import { PrismaService } from "./prisma.service";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
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
      rootPath: path.resolve(__dirname, "static"),
    }),
    AuthModule,
    UserModule,
    FileModule,
    ChatModule,
    MessageModule,
    ChatWIthAIModule,
    ChatMembersModule,
    PaginationModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: JwtStrategy }],
})
export class AppModule {}
