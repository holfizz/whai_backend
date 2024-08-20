import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { graphqlUploadExpress } from "graphql-upload-ts";
import { AppModule } from "./app.module";

const start = async () => {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 8800;
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "apollo-require-preflight"],
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }) as any);
  app.getHttpAdapter().getInstance().disable("x-powered-by");
  await app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`);
  });
};
start();
