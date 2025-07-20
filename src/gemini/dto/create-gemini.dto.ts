import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGeminiDto {}
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GeneratePlaging {
  @IsString()
  @IsNotEmpty()
  animalType: string;

  @IsString()
  @IsNotEmpty()
  animalCount: number;

  @IsString()
  @IsNotEmpty()
  conditionArriver: string;

  @IsString()
  @IsNotEmpty()
  localite: string;
}
