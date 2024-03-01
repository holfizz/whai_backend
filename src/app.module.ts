import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { AuthModule } from "./auth/auth.module";
import { JwtStrategy } from "./auth/jwt.strategy";
import { ChatModule } from "./chat/chat.module";
import { FileModule } from "./file/file.module";
import { PrismaService } from "./prisma.service";
import { UserModule } from "./user/user.module";
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "src/schema.gql",
      sortSchema: true,
      useGlobalPrefix: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "static"),
    }),
    AuthModule,
    UserModule,
    FileModule,
    ChatModule,
    MessageModule,
    // ChatWIthAIModule,
    // ChatModule,
    // MessageModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: JwtStrategy }],
})
export class AppModule {}
