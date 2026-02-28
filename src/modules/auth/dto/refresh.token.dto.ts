import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty({ example: "string" })
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}