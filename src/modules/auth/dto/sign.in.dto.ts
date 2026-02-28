import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {

    @ApiProperty({ example: "user@gmail.com" })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "12345678" })
    @IsNotEmpty()
    @IsString()
    password: string;

}