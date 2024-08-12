import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { User } from './user';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('signup')
export class SignupController {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }


  @Post()
  async postSignup(@Body() signupDto: { telegramId: string, password: string }, @Res() res) {

    console.log("signupDto: ", signupDto)

    let user = await this.userRepository.findOneBy({ telegramId: signupDto.telegramId })

    console.log("retrieved user: ", user)

    if (!user) {
      user = this.userRepository.create({
        ...signupDto,
        createdAt: new Date()
      });

      user = await this.userRepository.save(user)

      console.log("updated user: ", user)

      res.status(HttpStatus.CREATED).send(user);
    }

  }

}
