import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';

describe('BotService', () => {
  let app: TestingModule;
  let botService: BotService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [],
          synchronize: true,
          autoLoadEntities: true
        }),
        TypeOrmModule.forFeature([User]),
        ConfigModule.forRoot({
          isGlobal: true,
        })
      ],
      providers: [BotService],
    }).compile();

    botService = app.get(BotService);
    botService.botToken = "dummy"
    botService.createAdmin();
    botService.createBot(false);

  });

  describe('on /adminhello', () => {
    it('should forward message if admin', async () => {

      const onText = jest.spyOn(botService.bot, 'onText');
      await botService.startPolling();

      const innerOnText = onText.mock.calls[0][1]

      let sendMessageArgs = { receiverId: null, forwardedMessage: null }

      const dummyService = {
        innerOnText: innerOnText,
        bot: {
          sendMessage: (receiverIdInner, forwardedMessageInner) => {
            sendMessageArgs.receiverId = receiverIdInner;
            sendMessageArgs.forwardedMessage = forwardedMessageInner
          }
        }
      }

      let receiverId = 111222333,
        helloFromAdmin = "hello from admin",
        userInput = `/adminhello ${receiverId} ${helloFromAdmin}`;

      await dummyService.innerOnText(
        {
          text: userInput,
          message_id: 1,
          date: 123,
          chat: { id: 1, type: "private" },
          from: { id: 426419992, is_bot: false, first_name: "test" }
        },
        /\/adninhello /.exec(userInput))

      expect(sendMessageArgs.receiverId).toBe(receiverId)
      expect(sendMessageArgs.forwardedMessage).toBe(helloFromAdmin)

    });

    it('should return error if not admin', async () => {

      const onText = jest.spyOn(botService.bot, 'onText');
      await botService.startPolling();

      const innerOnText = onText.mock.calls[0][1]

      const senderId = 534534;
      const errorMessage = "Only an admin can use this command.";

      const receiverId = 111222333,
        helloFromAdmin = "hello from admin",
        userInput = `/adminhello ${receiverId} ${helloFromAdmin}`;

      const sendMessageArgs = { receiverId: null, forwardedMessage: null }

      const dummyService = {
        innerOnText: innerOnText,
        bot: {
          sendMessage: (receiverIdInner, forwardedMessageInner) => {
            sendMessageArgs.receiverId = receiverIdInner;
            sendMessageArgs.forwardedMessage = forwardedMessageInner
          }
        }
      }

      await dummyService.innerOnText(
        {
          text: userInput,
          message_id: 1,
          date: 123,
          chat: { id: 1, type: "private" },
          from: { id: senderId, is_bot: false, first_name: "test" }
        },
        /\/adninhello /.exec(userInput))

      expect(sendMessageArgs.receiverId).toBe(senderId)
      expect(sendMessageArgs.forwardedMessage).toBe(errorMessage)

    });

  });

  describe('on /start', () => {
    it('should create user and answer with webapp link', async () => {

      const on = jest.spyOn(botService.bot, 'on');
      await botService.startPolling();
      const callback = on.mock.calls[0][1]

      const sendMessageArgs = { receiverId: null, text: null, options: null }

      const sendMessage = jest.spyOn(botService.bot, 'sendMessage').mockImplementation();

      const sender = 5464356511;
      const userInput = "/start"

      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      let user = await userRepository.findOneBy({ telegramId: sender })
      expect(user).toBeNull()

      await callback(
        {
          text: userInput,
          message_id: 1,
          date: 123,
          chat: { id: 1, type: "private" },
          from: { id: sender, is_bot: false, first_name: "test" }
        },
        /\/start/.exec(userInput))

      expect(user).toBeDefined()
      expect(sendMessage.mock.calls[0][0]).toBe(sender)
      expect(sendMessage.mock.calls[0][1]).toContain("Hello")
      expect((sendMessage.mock.calls[0][2].reply_markup as any).inline_keyboard[0][0].web_app.url)
        .toContain(botService.webappUrl)

    });
  });
});
