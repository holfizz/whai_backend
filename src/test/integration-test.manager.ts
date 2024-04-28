import { PrismaService } from "@/prisma.service";
import { testUser } from "@/user/test/stub/user.stub";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as cookieParser from "cookie-parser";
import { AppModule } from "../app.module";
import { AuthService } from "../auth/auth.service";

export class IntegrationTestManager {
  public httpServer: any;

  private app: INestApplication;
  private accessToken: string;
  private prismaService: PrismaService;

  async beforeAll(): Promise<void> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleRef.createNestApplication();
    this.app.use(cookieParser());
    await this.app.init();
    this.httpServer = this.app.getHttpServer();

    const authService = this.app.get<AuthService>(AuthService);
    this.prismaService = this.app.get<PrismaService>(PrismaService);

    await this.prismaService.user.create({
      data: {
        ...testUser,
        isVerified: true,
      },
    });

    const user = await this.prismaService.user.findUnique({
      where: { email: testUser.email },
    });

    if (user) {
      this.accessToken = (await authService.login({ password: "yourStrong(!)Password", email: user.email })).accessToken;
    }
    this.accessToken = (
      await authService.login({
        ...testUser,
      })
    ).accessToken;
  }

  async afterAll() {
    await this.app.close();
  }

  getAccessToken(): string {
    return this.accessToken;
  }
}
