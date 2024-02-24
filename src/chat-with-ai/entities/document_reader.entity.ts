import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import * as path from 'path';

export class DocumentReader {
  loader;

  async readDocumentFile(filePath: string) {
    const pathFile = path.resolve(__dirname, '..', '..', 'static', filePath);
    if (filePath.endsWith('.pdf')) {
      this.loader = new PDFLoader(pathFile);
    } else if (filePath.endsWith('.docx')) {
      this.loader = new DocxLoader(pathFile);
    } else {
      throw new Error('Unsupported file format');
    }
    const pageData = await this.loader.load();
    return pageData[0].pageContent;
  }
}
