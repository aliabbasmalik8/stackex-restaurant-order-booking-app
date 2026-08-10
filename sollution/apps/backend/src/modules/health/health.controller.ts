import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      service: 'order-booking-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
