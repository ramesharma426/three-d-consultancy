import { Controller, Get, Render } from '@nestjs/common';
import { company } from '../config/company';

const portfolioPhotos = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return { n, src: `/images/portfolio/residential-${String(n).padStart(2, '0')}.jpg` };
});

@Controller()
export class PagesController {
  @Get()
  @Render('home')
  home() {
    return { company, portfolioPhotos };
  }
}
