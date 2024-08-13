import { FileService, FileType } from "@/file/file.service";
import { PrismaService } from "@/prisma.service";
import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { FileUpload } from "graphql-upload-ts";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async createCourse(userId: string, data: CourseInput, image?: FileUpload) {
    let imgUrl: string | null = null;
    if (image) {
      imgUrl = this.fileService.createFile(FileType.AVATAR, image);
    }

    const course = await this.prisma.course.create({
      data: {
        ...data,
        ownerID: userId,
        imgUrl,
      },
    });

    return {
      ...course,
      ...(await this.getCourseStats(course.id)),
    };
  }

  async getCourse(userId: string, id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        ownerID: userId,
        topics: {
          some: {},
        },
      },
      include: { courseAIHistory: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return { ...course, ...(await this.getCourseStats(course.id)) };
  }

  async getAllCourses(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: {
        ownerID: userId,
        topics: {
          some: {},
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return await Promise.all(
      courses.map(async course => {
        const courseId = course.id;

        return { ...course, ...(await this.getCourseStats(courseId)) };
      }),
    );
  }

  async getLastCourse(userId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        ownerID: userId,
        topics: {
          some: {},
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    if (!course) {
      throw new NotFoundException(`No courses found for user ID ${userId}`);
    }
    return { ...course, ...(await this.getCourseStats(course.id)) };
  }

  async updateCourse(userId: string, id: string, data: UpdateCourse, image?: FileUpload) {
    // Retrieve the existing course to get the old image path
    const existingCourse = await this.prisma.course.findUnique({
      where: { id, ownerID: userId },
    });

    if (!existingCourse) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    if (existingCourse.imgUrl) {
      this.fileService.removeFile(existingCourse.imgUrl);
    }

    let newImagePath = existingCourse.imgUrl; // Default to the existing image path

    if (image) {
      // Save the new image and get its path
      newImagePath = this.fileService.createFile(FileType.AVATAR, image);
    }

    // Update the course with the new image path
    return this.prisma.course.update({
      where: { id, ownerID: userId },
      data: {
        ...data,
        imgUrl: newImagePath,
      },
    });
  }
  async deleteCourse(userId: string, id: string) {
    // const course = await this.getCourse(userId, id);
    return this.prisma.course.delete({ where: { id } });
  }

  async getCourseStats(courseId: string) {
    // Fetch lessons, quizzes, and topics for the given course
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

    const totalTopicsTime = topics.reduce((sum, topic) => sum + (topic.completionTime || 0), 0);

    const totalItems = lessons.length + quizzes.length;
    const completedItems = completedLessons + completedQuizzes;
    const totalPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const roundedTotalTime = Math.round(totalTopicsTime / 60);

    return {
      progressPercents: totalPercent || 0,
      totalTopics: topics.length || 0,
      completionTime: roundedTotalTime || 0,
    };
  }
}
