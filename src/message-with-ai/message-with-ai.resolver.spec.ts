import { Test, TestingModule } from '@nestjs/testing';
import { MessageWithAiResolver } from './message-with-ai.resolver';
import { MessageWithAiService } from './message-with-ai.service';

describe('MessageWithAiResolver', () => {
  let resolver: MessageWithAiResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageWithAiResolver, MessageWithAiService],
    }).compile();

    resolver = module.get<MessageWithAiResolver>(MessageWithAiResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
