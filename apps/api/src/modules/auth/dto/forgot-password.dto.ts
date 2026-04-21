import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'owner@chowhouse.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email!: string;
}
