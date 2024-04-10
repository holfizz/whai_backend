import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { graphqlUploadExpress } from "graphql-upload-ts";
import { AppModule } from "./app.module";
const start = async () => {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 7700;
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.use(cookieParser());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }) as any);
  app.getHttpAdapter().getInstance().disable("x-powered-by");
  await app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`);
  });
};
start();
