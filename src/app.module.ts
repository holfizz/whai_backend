import { UserModule } from "@/user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";
import { AuthModule } from "./auth/auth.module";
import { ChatWIthAIModule } from "./chat-with-ai/chat-with-ai.module";
import { ChatModule } from "./chat/chat.module";
import { FileModule } from "./file/file.module";
import { MessageModule } from "./message/message.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "static"),
    }),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    ChatWIthAIModule,
    UserModule,
    FileModule,
    ChatModule,
    MessageModule,
  ],
})
export class AppModule {}
