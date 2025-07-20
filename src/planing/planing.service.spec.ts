import { Test, TestingModule } from '@nestjs/testing';
import { PlaningService } from './planing.service';

describe('PlaningService', () => {
  let service: PlaningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaningService],
    }).compile();

    service = module.get<PlaningService>(PlaningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
