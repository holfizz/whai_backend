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
    return this.updateCourseInfo(userId, id);
  }

  async getAllCourses(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { ownerID: userId },
      orderBy: { createdAt: "desc" },
    });

    if (!courses || courses.length === 0) {
      throw new NotFoundException(`No courses found for user ID ${userId}`);
    }

    // Update progress percentage for each course asynchronously
    const updatedCourses = await Promise.all(
      courses.map(async course => {
        const courseId = course.id;
        await this.updateCourseInfo(userId, courseId);
        return course;
      }),
    );

    return updatedCourses;
  }

  async getLastCourse(userId: string) {
    const course = await this.prisma.course.findFirst({
      where: { ownerID: userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!course) {
      throw new NotFoundException(`No courses found for user ID ${userId}`);
    }
    return this.updateCourseInfo(userId, course.id);
  }

  async updateCourse(userId: string, id: string, data: UpdateCourse) {
    return this.prisma.course.update({
      where: { id, ownerID: userId },
      data,
    });
  }

  async deleteCourse(userId: string, id: string) {
    // const course = await this.getCourse(userId, id);
    return this.prisma.course.delete({ where: { id } });
  }

  async updateCourseInfo(userId: string, courseId: string) {
    // Получаем все уроки и квизы по ID курса
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
    });
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId },
    });
    // const lessonsIcons = await this.prisma.subtopic.findMany({
    //      where: { courseId },
    //    });
    //    const quizzesIcons = await this.prisma.subtopic.findMany({
    //      where: { courseId },
    //    });

    // Вычисляем количество завершенных уроков и квизов
    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    const completedQuizzes = quizzes.filter(quiz => quiz.isCompleted).length;

    // Вычисляем количество времени в курсе
    const timeLessons = lessons.filter(lesson => lesson.completionTime);
    const timeQuizzes = quizzes.filter(quiz => quiz.completionTime);

    // Вычисляем количество времени в курсе
    // const iconsLessons = lessons.filter(lesson => lesson.);
    // const iconsQuizzes = quizzes.filter(quiz => quiz.completionTime);

    // Рассчитываем общее количество элементов и процент завершения
    const totalItems = lessons.length + quizzes.length;
    const completedItems = completedLessons + completedQuizzes;
    const totalPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return this.prisma.course.update({
      where: { id: courseId, ownerID: userId },
      data: {
        progressPercents: totalPercent,
        // completionTime:,
      },
    });
  }
}
