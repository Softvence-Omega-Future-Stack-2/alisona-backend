import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, Length } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNumber()
    otp: number;
}