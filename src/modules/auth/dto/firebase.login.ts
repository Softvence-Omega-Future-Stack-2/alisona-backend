import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FirebaseLoginDto {
    @ApiProperty({ example: "string" })
    @IsNotEmpty()
    @IsString()
    idToken: string
}