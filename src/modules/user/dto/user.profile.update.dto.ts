import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({ example: "Mohammad Jihad" })
    @IsNotEmpty()
    @IsString()
    username: string

    @ApiProperty({ example: "user@gmail.com" })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "" })
    @IsNotEmpty()
    @IsEmail()
    phone: string;
}