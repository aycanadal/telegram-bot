import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user";
import TelegramBot from "node-telegram-bot-api";

@Injectable()
export class BotService implements OnModuleInit {

    botToken = process.env.BOT_TOKEN;
    bot: TelegramBot;
    webappUrl="https://svelte-kit-telegram-webapp.fly.dev?firstName="

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }


    async onModuleInit() {
        await this.createAdmin();
        this.createBot();
        await this.startPolling();
    }

    createBot(polling = true) {

        process.env.NTBA_FIX_319 = "1";
        const TelegramBot = require('node-telegram-bot-api');
        this.bot = new TelegramBot(this.botToken, { polling });

    }


    async startPolling() {

        const userRepository = this.userRepository

        this.bot.onText(/\/adminhello /, async function onText(message) {

            let user = await userRepository.findOneBy({ telegramId: message.from.id })

            if (!user || !user.isAdmin) {
                this.bot.sendMessage(message.from.id, "Only an admin can use this command.")
                return;
            }

            const messageText = message.text.toString().trim();
            let words = messageText.split(" ");
            const receiverId = +words[1];
            words.splice(0, 2);
            const forwardedMessage = words.join(" ");

            if (receiverId)
                await this.bot.sendMessage(receiverId, forwardedMessage);

        });

        this.bot.on('message', async (msg) => {
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

                console.log("calling sendMessage.")
                await this.bot.sendMessage(
                    msg.from.id,
                    "Hello " + msg.from.first_name + ", what would you like to do?",
                    {
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        text: "Open webapp",
                                        web_app: { url: this.webappUrl + msg.from.first_name },
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
            telegramId: 426419992,
            firstName: "Aycan",
            username: "ayci",
            createdAt: new Date(),
            isAdmin: true
        });

        await this.userRepository.save(user)

    }
}
