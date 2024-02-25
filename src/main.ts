import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const start = async () => {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 7700;
  app.setGlobalPrefix("api");
  app.enableCors();

  const config = new DocumentBuilder().setTitle("less about nest js").setDescription("rest api documentation").setVersion("1.0.0").addTag("holfizz").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);
  await app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`);
  });
};
start();
