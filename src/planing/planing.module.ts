import { Module } from '@nestjs/common';
import { PlaningService } from './planing.service';
import { PlaningController } from './planing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Elevage, ElevageSchema } from './entities/planing.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Elevage.name, schema: ElevageSchema }]),
  ],
  controllers: [PlaningController],
  providers: [PlaningService],
  exports: [PlaningService],
})
export class PlaningModule {}
