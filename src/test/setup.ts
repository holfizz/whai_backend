import { AuthService } from "@/auth/auth.service";
import { testUser } from "@/user/test/stub/user.stub";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

export default async (): Promise<void> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const usersService = moduleRef.get<AuthService>(AuthService);
  await usersService.signUp(testUser);

  await app.close();
};
