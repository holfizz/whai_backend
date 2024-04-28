import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(userId: string, data: CourseInput) {
    return this.prisma.course.create({
      data: {
        ...data,
        ownerID: userId,
      },
    });
  }

  async getCourse(userId: string, id: string) {
    const course = await this.prisma.course.findUnique({ where: { id, ownerID: userId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async updateCourse(userId: string, id: string, data: UpdateCourse) {
    return this.prisma.course.update({
      where: { id, ownerID: userId },
      data,
    });
  }

  async deleteCourse(userId: string, id: string) {
    const course = await this.getCourse(userId, id);
    return this.prisma.course.delete({ where: { id } });
  }
}
