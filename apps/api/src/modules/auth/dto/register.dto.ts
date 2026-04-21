import { IsEmail, IsString, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'Kofi Mensah' })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters.' })
  @MaxLength(120)
  @Transform(({ value }) => (value as string)?.trim())
  fullName!: string;

  @ApiProperty({ example: 'owner@chowhouse.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @Transform(({ value }) => (value as string)?.toLowerCase().trim())
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and a number.',
  })
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
