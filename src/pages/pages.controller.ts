import { Controller, Get, Render } from '@nestjs/common';
import { company } from '../config/company';

@Controller()
export class PagesController {
  @Get()
  @Render('home')
  home() {
    return { company };
  }
}
