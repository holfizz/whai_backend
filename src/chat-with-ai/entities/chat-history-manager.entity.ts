import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from 'langchain/schema';

export class ChatHistoryManager {
  readonly chatHistory: BaseMessage[];

  constructor(systemMessage?: string) {
    this.chatHistory = [];

    if (systemMessage) {
      this.addSystemMessage(systemMessage);
    }
  }

  private addSystemMessage(message: string) {
    this.chatHistory.push(new SystemMessage(message));
  }

  addAiMessage(message: string) {
    this.chatHistory.push(new AIMessage(message));
  }

  addHumanMessage(message: string, fileData?: string) {
    const textData = (message, fileData) => {
      if (fileData) {
        return message + '' + `{fileData: ${fileData} }`;
      } else {
        return message;
      }
    };
    this.chatHistory.push(new HumanMessage(textData(message, fileData)));
  }
  deleteContext() {
    return this.chatHistory.splice(0, this.chatHistory.length);
  }
  getChatMessages() {
    return this.chatHistory;
  }
}
