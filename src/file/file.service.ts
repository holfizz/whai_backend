import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import { FileUpload } from "graphql-upload-ts";
import * as path from "path";
import * as uuid from "uuid";

export enum FileType {
  AUDIO = "audio",
  IMAGE = "image",
  AVATAR = "avatar",
  DOCUMENT = "document",
}

@Injectable()
export class FileService {
  createFile(type: FileType, file: FileUpload): string {
    if (!file) {
      throw new HttpException("File is not provided", HttpStatus.BAD_REQUEST);
    }

    try {
      const { createReadStream, filename } = file;
      const fileExtension = path.extname(filename);
      const fileName = `${uuid.v4()}${fileExtension}`;
      // Путь к файлам в папке static в корневой директории
      const filePath = path.resolve(__dirname, "..", "..", "static", type);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      const writeStream = fs.createWriteStream(path.join(filePath, fileName));
      createReadStream().pipe(writeStream);

      return `${type}/${fileName}`;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  removeFile(fileName: string) {
    try {
      // Путь к файлам в папке static в корневой директории
      const filePath = path.resolve(__dirname, "..", "..", "..", "..", "static", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
