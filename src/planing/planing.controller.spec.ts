import { Test, TestingModule } from '@nestjs/testing';
import { PlaningController } from './planing.controller';
import { PlaningService } from './planing.service';

describe('PlaningController', () => {
  let controller: PlaningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaningController],
      providers: [PlaningService],
    }).compile();

    controller = module.get<PlaningController>(PlaningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
