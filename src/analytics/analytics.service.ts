import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { LearningSessionInput } from "./dto/analytics.input";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateOrCreateLearningSession(userId: string, updateLearningSessionInput: LearningSessionInput) {
    const { sessionDetails } = updateLearningSessionInput;
    let sessionResult;
    for (const sessionDetail of sessionDetails) {
      const { date, courseId, hoursSpent } = sessionDetail;

      const existingSession = await this.prisma.learningSession.findFirst({
        where: {
          userId: userId,
          sessionDetails: {
            path: ["date"],
            equals: date.toISOString(),
          },
          AND: {
            sessionDetails: {
              path: ["courseId"],
              equals: courseId,
            },
          },
        },
      });

      if (existingSession) {
        sessionResult = await this.prisma.learningSession.update({
          where: { id: existingSession.id },
          data: {
            sessionDetails: {
              hoursSpent: { increment: hoursSpent },
            },
          },
        });
      } else {
        sessionResult = await this.prisma.learningSession.create({
          data: {
            userId,
            sessionDetails: JSON.stringify([sessionDetail]),
          },
        });
      }
    }
    console.log(sessionResult);
    return { sessionDetails: sessionResult };
  }
  // findAll() {
  //   return `This action returns all analytics`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} analytics`;
  // }

  // update(id: number, updateAnalyticsInput: UpdateAnalyticsInput) {
  //   return `This action updates a #${id} analytics`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} analytics`;
  // }
}
