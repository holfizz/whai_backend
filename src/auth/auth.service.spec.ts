// import { getJwtConfig } from "@/config/jwt.config";
// import { FileModule } from "@/file/file.module";
// import { FileService } from "@/file/file.service";
// import { PrismaService } from "@/prisma.service";
// import { UserModule } from "@/user/user.module";
// import { UserService } from "@/user/user.service";
// import { MailerModule } from "@nestjs-modules/mailer";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { JwtModule } from "@nestjs/jwt";
// import { Test, TestingModule } from "@nestjs/testing";
// import { AuthResolver } from "./auth.resolver";
// import { AuthService } from "./auth.service";
// import { JwtStrategy } from "./jwt.strategy";
// import { MailService } from "./mail.service";

// describe("AuthService", () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService, PrismaService, JwtStrategy, ConfigService, UserService, MailService, FileService, AuthResolver],
//       imports: [
//         ConfigModule.forRoot(),
//         JwtModule.registerAsync({
//           imports: [ConfigModule],
//           inject: [ConfigService],
//           useFactory: getJwtConfig,
//         }),
//         MailerModule.forRoot({
//           transport: {
//             host: process.env.SMTP_HOST,
//             port: process.env.SMTP_PORT,
//             ignoreTLS: false,
//             secure: false,
//             auth: {
//               user: process.env.SMTP_USER,
//               pass: process.env.SMTP_PASSWORD,
//             },
//           },
//         }),
//         UserModule,
//         FileModule,
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it("should be defined", () => {
//     expect(service).toBeDefined();
//   });

//   it("should sign up a user", async () => {
//     const signUpInput = {
//       firstName: "John",
//       lastName: "Doe",
//       phoneNumber: "1234567890",
//       email: "john.doe@example.com",
//       password: "password",
//     };

//     const user = await service.signUp(signUpInput);

//     expect(user).toBeDefined();
//     expect(user.user.email).toEqual("john.doe@example.com");
//   });

//   it("should fail to sign up a user with existing email", async () => {
//     const signUpInput = {
//       firstName: "John",
//       lastName: "Doe",
//       phoneNumber: "1234567890",
//       email: "john.doe@example.com",
//       password: "password",
//     };

//     await service.signUp(signUpInput);

//     await expect(service.signUp(signUpInput)).rejects.toThrow("Пользователь с таким email уже существует");
//   });

//   it("should log in a user", async () => {
//     const loginInput = {
//       email: "john.doe@example.com",
//       password: "password",
//     };

//     const { user } = await service.login(loginInput);

//     expect(user).toBeDefined();
//     expect(user.email).toEqual("john.doe@example.com");
//   });

//   it("should fail to log in a user with incorrect password", async () => {
//     const loginInput = {
//       email: "john.doe@example.com",
//       password: "wrongpassword",
//     };

//     await expect(service.login(loginInput)).rejects.toThrow("Неверный пароль");
//   });
// });
