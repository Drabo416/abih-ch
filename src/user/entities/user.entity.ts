import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GenderEnum } from 'src/enum/gender.enum';

@Schema({ timestamps: true })
export class UserEntity {
  _id: string;
  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop({ enum: GenderEnum })
  gender?: string;

  @Prop()
  password?: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  salt?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
