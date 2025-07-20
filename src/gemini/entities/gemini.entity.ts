// src/schemas/conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/entities/user.entity';

@Schema({ timestamps: true })
export class ConversationEntity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'UserEntity', required: true })
  user: UserEntity;

  @Prop({ type: Types.ObjectId, ref: 'SystemPromptEntity' })
  systemPrompt: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['bovins', 'ovins', 'caprins', 'volailles', 'porcins'],
    required: true,
  })
  animalType: string;

  @Prop([
    {
      content: { type: String, required: true },
      role: {
        type: String,
        enum: ['user', 'assistant', 'system', 'expert'],
        required: true,
      },
      timestamp: { type: Date, default: Date.now },
      metadata: {
        isVerified: { type: Boolean, default: false },
        verifiedBy: { type: Types.ObjectId, ref: 'UserEntity' },
        sources: [String],
      },
    },
  ])
  messages: Array<{
    content: string;
    role: string;
    timestamp?: Date;
    metadata?: {
      isVerified?: boolean;
      verifiedBy?: Types.ObjectId;
      sources?: string[];
    };
  }>;

  @Prop({
    type: String,
    enum: ['actif', 'en_attente_expert', 'resolu', 'archive'],
    default: 'actif',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
  assignedExpert: Types.ObjectId;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationEntity);
