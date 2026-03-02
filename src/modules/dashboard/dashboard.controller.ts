import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }


  @Get('home')
  @ApiOperation({ summary: 'Get dashboard summary data' })
  @ApiResponse({ status: 200, description: 'Dashboard data fetched successfully' })
  async dashboardHome() {
    return this.dashboardService.dashboardHome();
  }


  @Get('events')
  @ApiOperation({ summary: 'Get paginated event list with filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'music' })
  @ApiQuery({ name: 'category', required: false, example: 'concert' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiResponse({ status: 200, description: 'Event list fetched successfully' })
  async eventManagement(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardService.eventManagement(
      page,
      limit,
      search,
      category,
      status,
    );
  }


  @Get('users')
  @ApiOperation({ summary: 'Get paginated user list with filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'jihad' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiResponse({ status: 200, description: 'User list fetched successfully' })
  async userManagement(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardService.userManagement(
      page,
      limit,
      search,
      status,
    );
  }


  @Get('bookings')
  @ApiOperation({ summary: 'Get paginated booking list' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Booking list fetched successfully' })
  async bookingManagement(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.bookingManagement(page, limit);
  }
}