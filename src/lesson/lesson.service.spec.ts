import { FolderInput } from "@/folder/dto/create-folder.input";
import { FolderService } from "@/folder/folder.service";
import { PrismaService } from "@/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("FolderService", () => {
  let service: FolderService;
  let prisma: PrismaService;
  let course;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderService, PrismaService],
    }).compile();

    service = module.get<FolderService>(FolderService);
    prisma = module.get<PrismaService>(PrismaService);

    course = await prisma.course.create({
      data: {
        name: "Test course",
        ownerID: "123123",
      },
    });
  });

  afterAll(async () => {
    await prisma.folder.deleteMany({
      where: { courseId: course.id },
    });

    await prisma.course.delete({
      where: { id: course.id },
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new folder", async () => {
      const newFolder: FolderInput = {
        name: "Test folder",
        courseId: course.id,
      };
      const folder = await service.createFolder(newFolder);
      expect(folder).toBeDefined();
      expect(folder.id).toBeDefined();
      expect(folder.name).toEqual(newFolder.name);
      expect(folder.courseId).toEqual(newFolder.courseId);
    });
  });
  describe("update", () => {
    it("should update a folder", async () => {
      const newFolder: FolderInput = {
        name: "Test Folder for Update",
        courseId: course.id,
      };
      const folderToUpdate = await service.createFolder(newFolder);
      const updatedFolder = await service.updateFolder(folderToUpdate.id, { name: "Updated Folder", description: "Description" });
      expect(updatedFolder).toBeDefined();
      expect(updatedFolder.id).toEqual(folderToUpdate.id);
      expect(updatedFolder.name).toEqual("Updated Folder");
    });

    it("should throw an error if folder does not exist", async () => {
      await expect(service.updateFolder("non-existing-id", { name: "New name" })).rejects.toThrowError();
    });
  });

  describe("delete", () => {
    it("should delete a folder", async () => {
      const newFolder: FolderInput = {
        name: "Test Folder for Deletion",
        courseId: course.id,
      };
      const folderToDelete = await service.createFolder(newFolder);
      await expect(service.deleteFolder(folderToDelete.id)).resolves.toBeTruthy();
    });

    it("should throw an error if folder does not exist", async () => {
      await expect(service.deleteFolder("non-existing-id")).rejects.toThrowError();
    });
  });
});
