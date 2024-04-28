import { PrismaService } from "@/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

export default async (): Promise<void> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const prismaService = moduleRef.get<PrismaService>(PrismaService);
  try {
    await prismaService.user.delete({ where: { email: "testuser@example.com", phoneNumber: "+12345678900" } });
  } catch (error) {
    console.error("Failed to delete user:", error);
  }

  await app.close();
};
