import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import * as path from 'path';

export class DocumentReader {
  loader;

  readDocumentFile(filePath: string) {
    if (filePath.endsWith('.pdf')) {
      this.loader = new PDFLoader(
        path.resolve(__dirname, '..', '..', 'static', filePath),
      );
    } else if (filePath.endsWith('.docx')) {
      this.loader = new DocxLoader(
        path.resolve(__dirname, '..', '..', 'static', filePath),
      );
    } else {
      throw new Error('Unsupported file format');
    }
    return this.loader.load();
  }
}
