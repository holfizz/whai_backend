import { AppModule } from "@/app.module";
import { INestApplication } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { Test } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import { graphqlUploadExpress } from "graphql-upload-ts";

export class IntegrationTestManager {
  private httpServer: any;
  private app: INestApplication;
  private readonly corsOptions: CorsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  async beforeAll(): Promise<void> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    this.app = moduleRef.createNestApplication();
    this.app.use(cookieParser());
    this.app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }) as any);
    this.app.enableCors(this.corsOptions);

    await this.app.init();
    this.httpServer = this.app.getHttpServer();
  }
}
