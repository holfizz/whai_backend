import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { graphqlUploadExpress } from "graphql-upload-ts";
import { AppModule } from "./app.module";
const start = async () => {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 7700;
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: ["http://localhost:3000", "http://194.116.215.109/api/graphql"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.use(cookieParser());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }) as any);
  app.getHttpAdapter().getInstance().disable("x-powered-by");
  const config = new DocumentBuilder().setTitle("less about nest js").setDescription("rest api documentation").setVersion("1.0.0").addTag("holfizz").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);
  await app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`);
  });
};
start();
