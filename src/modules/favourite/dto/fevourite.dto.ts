import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FevouriteDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    eventId: string;
}
