import { IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  phone: string;

  @IsOptional()
  email: string;

  @IsOptional()
  password: string;
}
