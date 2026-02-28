import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SentOTPDto {
    @ApiProperty({ example: "mohammadjihad4040@gmail.com" })
    @IsNotEmpty()
    @IsString()
    email: string
}