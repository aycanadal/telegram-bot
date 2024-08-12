import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user';
import { SignupController } from './signup.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: [],
    synchronize: true,
    autoLoadEntities:true
    }),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  controllers: [AppController, SignupController],
  providers: [BotService],
})
export class AppModule {}
