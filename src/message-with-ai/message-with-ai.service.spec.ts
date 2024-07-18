// import { FileService } from "@/file/file.service";
// import { PaginationModule } from "@/pagination/pagination.module";
// import { PrismaService } from "@/prisma.service";
// import { HttpModule } from "@nestjs/axios";
// import { Test, TestingModule } from "@nestjs/testing";
// import { MessageWithAiResolver } from "./message-with-ai.resolver";
// import { MessageWithAiService } from "./message-with-ai.service";
//
// describe("MessageWithAiService", () => {
//   let service: MessageWithAiService;
//   let prisma: PrismaService;
//   let user;
//   let chatWithAI;
//
//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [MessageWithAiResolver, MessageWithAiService, PrismaService, FileService],
//       imports: [PaginationModule, HttpModule],
//     }).compile();
//
//     service = module.get<MessageWithAiService>(MessageWithAiService);
//     prisma = module.get<PrismaService>(PrismaService);
//
//     user = await prisma.user.create({
//       data: {
//         email: "example@example.com",
//         password: "password",
//         firstName: "Test First Name",
//         lastName: "Test First Name",
//         phoneNumber: "+123345678900",
//       },
//     });
//
//     chatWithAI = await prisma.chatWithAI.create({
//       data: {
//         id: "testChatId",
//         userId: user.id,
//       },
//     });
//   });
//
//   afterAll(async () => {
//     await prisma.messageWithAI.deleteMany({
//       where: { chatWithAIId: chatWithAI.id },
//     });
//
//     await prisma.chatWithAI.delete({
//       where: { id: chatWithAI.id },
//     });
//
//     await prisma.user.delete({
//       where: { id: user.id },
//     });
//   });
//
//   it("should be defined", () => {
//     expect(service).toBeDefined();
//   });
//
//   describe("getAIModelAnswer", () => {
//     it("should get AI model answer for a chat", async () => {
//       //WARNING: this test works but to save tokens it is disabled
//       // const userId = user.id;
//       // const newMessage: MessageWithAIInput = {
//       //   content: "Hello AI",
//       //   chatWithAIId: "testChatId",
//       // };
//       // const pubSub = { publish: jest.fn() };
//       // const message = await service.getAIModelAnswer(userId, newMessage, pubSub as any);
//       // expect(message).toBeDefined();
//       // expect(message.id).toBeDefined();
//       // expect(message.chatWithAIId).toEqual(newMessage.chatWithAIId);
//       // expect(message.content).toBeTruthy();
//     });
//   });
// });
