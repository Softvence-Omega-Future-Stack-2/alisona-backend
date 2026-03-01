import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}