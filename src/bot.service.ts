import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user";

@Injectable()
export class BotService implements OnModuleInit {

    botToken = process.env.BOT_TOKEN;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }


    onModuleInit() {
        this.initialize();
    }


    async initialize() {

        await this.createAdmin();

        process.env.NTBA_FIX_319 = "1";
        const TelegramBot = require('node-telegram-bot-api');
        const bot = new TelegramBot(this.botToken, { polling: true });

        const userRepository = this.userRepository

        bot.onText("/adminhello ", async function onText(message) {

            let user = await userRepository.findOneBy({ telegramId: message.from.id })

            if (!user || !user.isAdmin) {
                bot.sendMessage(message.from.id, "Only an admin can use this command.")
                return;
            }

            const messageText = message.text.toString().trim();
            let words = messageText.split(" ");
            const receiverId = words[1];
            words.splice(0, 2);
            const forwardedMessage = words.join(" ");

            if (receiverId)
                bot.sendMessage(receiverId, forwardedMessage);

        });

        bot.on('message', async (msg) => {
            let command = "/start";
            if (msg.text.toString().toLowerCase().indexOf(command) === 0) {

                let user = await this.userRepository.findOneBy({ telegramId: msg.from.id })

                if (!user) {
                    user = this.userRepository.create({
                        telegramId: msg.from.id,
                        firstName: msg.from.first_name,
                        username: msg.from.username,
                        createdAt: new Date()
                    });
                    user = await this.userRepository.save(user)
                }

                bot.sendMessage(
                    msg.from.id,
                    "Hello " + msg.from.first_name + ", what would you like to do?",
                    {
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        text: "Open webapp",
                                        web_app: { url: "https://svelte-kit-telegram-webapp.vercel.app/?firstName=" + msg.from.first_name },
                                    },
                                ]
                            ]
                        }
                    }
                );
            }
        })
    }

    async createAdmin() {

        let user = this.userRepository.create({
            telegramId: "426419992",
            firstName: "Aycan",
            username: "ayci",
            createdAt: new Date(),
            isAdmin: true
        });

        await this.userRepository.save(user)

    }
}
