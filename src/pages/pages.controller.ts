import { Controller, Get, Render } from '@nestjs/common';
import { company } from '../config/company';

@Controller()
export class PagesController {
  @Get()
  @Render('home')
  home() {
    return { company };
  }

  @Get('about')
  @Render('about')
  about() {
    return { company };
  }

  @Get('services')
  @Render('services')
  services() {
    return { company };
  }

  @Get('portfolio')
  @Render('portfolio')
  portfolio() {
    return { company };
  }

  @Get('contact')
  @Render('contact')
  contact() {
    return { company };
  }
}
