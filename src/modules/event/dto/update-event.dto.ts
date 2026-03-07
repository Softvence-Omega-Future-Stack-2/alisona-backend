import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './publish.event';


export class UpdateEventDto extends PartialType(CreateEventDto) {}