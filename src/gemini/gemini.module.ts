import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from 'src/user/entities/user.entity';
import {
  ConversationEntity,
  ConversationSchema,
} from './entities/gemini.entity';
import { PlaningModule } from 'src/planing/planing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ConversationEntity.name, schema: ConversationSchema },
      // { name: UsageStatsEntity.name, schema: UsageStatsSchema },
    ]),
    PlaningModule,
  ],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}
