import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(userId: string, data: CourseInput) {
    const course = await this.prisma.course.create({
      data: {
        ...data,
        ownerID: userId,
      },
    });
    return {
      ...course,
      ...(await this.getCourseStats(course.id)),
    };
  }

  async getCourse(userId: string, id: string) {
    const course = await this.prisma.course.findUnique({ where: { id, ownerID: userId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return { ...course, ...(await this.getCourseStats(course.id)) };
  }

  async getAllCourses(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { ownerID: userId },
      orderBy: { createdAt: "desc" },
    });

    if (!courses || courses.length === 0) {
      throw new NotFoundException(`No courses found for user ID ${userId}`);
    }

    return await Promise.all(
      courses.map(async course => {
        const courseId = course.id;

        return { ...course, ...(await this.getCourseStats(courseId)) };
      }),
    );
  }

  async getLastCourse(userId: string) {
    const course = await this.prisma.course.findFirst({
      where: { ownerID: userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!course) {
      throw new NotFoundException(`No courses found for user ID ${userId}`);
    }
    return { ...course, ...(await this.getCourseStats(course.id)) };
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

  async getCourseStats(courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
    });
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId },
    });
    const topics = await this.prisma.topic.findMany({
      where: { courseId },
    });
    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    const completedQuizzes = quizzes.filter(quiz => quiz.isCompleted).length;

    const totalLessonsTime = lessons.reduce((sum, lesson) => sum + lesson.completionTime, 0);
    const totalQuizzesTime = quizzes.reduce((sum, quiz) => sum + quiz.completionTime, 0);

    const totalItems = lessons.length + quizzes.length;
    const completedItems = completedLessons + completedQuizzes;
    const totalPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const totalTime = totalLessonsTime + totalQuizzesTime;
    const roundedTotalTime = Math.round(totalTime / 60);
    return {
      progressPercents: totalPercent || 0,
      totalTopics: topics.length || 0,
      completionTime: roundedTotalTime || 0,
    };
  }
}
