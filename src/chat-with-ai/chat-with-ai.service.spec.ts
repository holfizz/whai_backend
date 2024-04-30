import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAIInput } from "./dto/chat-with-ai.Input";

describe("ChatWithAIService", () => {
  let service: ChatWithAIService;
  let prisma: PrismaService;
  let user;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatWithAIService, PrismaService, PaginationService],
    }).compile();

    service = module.get<ChatWithAIService>(ChatWithAIService);
    prisma = module.get<PrismaService>(PrismaService);

    user = await prisma.user.create({
      data: {
        email: "example@example.com",
        password: "password",
        firstName: "Test First Name",
        lastName: "Test First Name",
        phoneNumber: "+123345678900",
      },
    });
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { isVerified: true },
    // });
  });

  afterAll(async () => {
    await prisma.chatWithAI.deleteMany({
      where: { userId: user.id },
    });

    await prisma.user.delete({
      where: { phoneNumber: user.phoneNumber },
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createChatWithAI", () => {
    it("should create a new chat with AI", async () => {
      const userId = user.id;
      const newChat: ChatWithAIInput = {
        title: "Hello AI",
      };
      const chat = await service.createChatWithAI(userId, newChat);
      expect(chat).toBeDefined();
      expect(chat.id).toBeDefined();
      expect(chat.userId).toEqual(userId);
      expect(chat.title).toEqual(newChat.title);
    });
  });

  describe("getAllChatsWithAi", () => {
    it("should get all chats with AI", async () => {
      const userId = user.id;
      const chats = await service.getAllChatsWithAi(userId);
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
    });
  });
});
