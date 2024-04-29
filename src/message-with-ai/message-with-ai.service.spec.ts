import { Test, TestingModule } from '@nestjs/testing';
import { MessageWithAiService } from './message-with-ai.service';

describe('MessageWithAiService', () => {
  let service: MessageWithAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageWithAiService],
    }).compile();

    service = module.get<MessageWithAiService>(MessageWithAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
