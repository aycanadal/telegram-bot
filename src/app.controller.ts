import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

@Controller()
export class AppController {

  constructor() {}

  @Get()
  getBot(@Res() res) {
    res.status(HttpStatus.OK).send("Bot server is up.");
  }
  
}
