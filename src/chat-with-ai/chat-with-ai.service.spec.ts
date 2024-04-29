import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAIInput } from "./dto/chat-with-ai.Input";

describe("ChatWithAIService", () => {
  let service: ChatWithAIService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatWithAIService, PrismaService, PaginationService],
    }).compile();

    service = module.get<ChatWithAIService>(ChatWithAIService);
    prisma = module.get<PrismaService>(PrismaService);

    // Assuming that user and chatWithAI are created here for testing
    // await prisma.user.create({
    //   data: {
    //     id: "testUserId",
    //     email: "exam",
    //   },
    // });
  });

  afterAll(async () => {
    await prisma.messageWithAI.deleteMany({
      where: { chatWithAIId: "testChatId" },
    });

    await prisma.chatWithAI.deleteMany({
      where: { userId: "testUserId" },
    });

    await prisma.user.delete({
      where: { id: "testUserId" },
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createChatWithAI", () => {
    it("should create a new chat with AI", async () => {
      const userId = "testUserId";
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
      const userId = "testUserId";
      const chats = await service.getAllChatsWithAi(userId);
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
    });
  });
});
