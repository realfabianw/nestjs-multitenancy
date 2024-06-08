import { IsEmail, IsNotEmpty } from 'class-validator';

export default class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
