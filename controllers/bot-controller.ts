import fs from "fs";
import { PNG } from "pngjs";
import { Message, SendMessageOptions } from "node-telegram-bot-api";
import bot from "../servises/telefram-service";
import PuppeteerService from "../servises/puppeteer-service";
import PixelmatchService from "../servises/pixelmatch-service";

class BotController {
	chats: number[];
	constructor() {
		this.setCommands();
		this.chats = [436262107];
	}

	async setCommands() {
		bot.setMyCommands([
			{ command: "/alerts", description: "Показати мапу" },
			{ command: "/help", description: "Допомога" },
		]);
	}

	// setReplyKeyboard(): SendMessageOptions {
	// 	const keyboard: KeyboardButton[][] = [];

	// 	keyboard.push(
	// 		[
	// 			{
	// 				text: "Text",
	// 			},

	// 	);

	// 	return {
	// 		reply_markup: {
	// 			resize_keyboard: true,
	// 			keyboard,
	// 		},
	// 	};
	// }

	async sendError(chatId: number) {
		await bot.sendMessage(chatId, `Помилочка  ¯\\_(ツ)_/¯`);
	}

	async sendWait(chatId: number) {
		await bot.sendMessage(chatId, `Чекайте, це займе 3-7 секунд...`);
	}

	async onHelp(chatId: number) {
		return await bot.sendMessage(
			chatId,
			`Heeeeeeeeeeelp`,
			// {
			// 	...(chat.id ? this.setReplyKeyboard() : {}),
			// 	parse_mode: "Markdown",
			// },
		);
	}

	async getAlertsScreenshot() {
		const url = "https://alerts.in.ua/";
		const selector = ".alert-map.map-container.no-select>svg>g[fill='none']";

		return await PuppeteerService.getSelectorScreenshot(url, selector, () => {
			localStorage.setItem("darkMode", "true");
			localStorage.setItem("showDurationGradient", "true");
			localStorage.setItem("showOblastLabels", "true");
		});
	}

	async onStart(msg: Message) {
		const {
			chat: { id: chatId },
		} = msg;

		this.setCommands();

		await bot.sendMessage(
			chatId,
			`Вітаю, Ви підписались на оновленя мапи тривог України (https://alerts.in.ua/).\nЦей бот надсилає мапу, коли на ній є будь яка зміна.\nОсь як виглядає мапа зараз:`,
			{
				disable_web_page_preview: true,
			},
		);

		return await bot.sendPhoto(
			chatId,
			fs.readFileSync("base.png"),
			{},
			{
				filename: "mapScreenshot",
				contentType: "image/png",
			},
		);
	}

	async onShowMap(msg: Message) {
		const {
			chat: { id: chatId },
		} = msg;

		this.sendWait(chatId);

		const screenShot = await this.getAlertsScreenshot();

		if (screenShot) {
			await bot.sendPhoto(
				chatId,
				screenShot,
				{},
				{
					filename: "mapScreenshot",
					contentType: "image/png",
				},
			);
		}
	}

	async onAction(msg: Message) {
		let {
			text,
			chat: { id: chatId },
		} = msg;

		switch (text) {
			//start bot
			case "/start":
				await this.onStart(msg);
				return;
			//show map
			case "/alerts":
				await this.onShowMap(msg);
				return;
			default:
				//help
				await this.onHelp(chatId);
				return;
		}
	}

	async processDiff() {
		const date1 = Date.now();
		let diffPixels = 0;

		const newScreenshot = await this.getAlertsScreenshot();

		if (newScreenshot) {
			diffPixels = await PixelmatchService.diffImages(
				fs.readFileSync("base.png"),
				newScreenshot as Buffer,
			);

			console.log(`${diffPixels} pixels`);

			if (diffPixels > 200) {
				fs.writeFileSync("base.png", newScreenshot);

				await Promise.all(
					this.chats.map(async (chat) => {
						return await bot.sendPhoto(
							chat,
							newScreenshot as Buffer,
							{},
							{
								filename: "mapScreenshot",
								contentType: "image/png",
							},
						);
					}),
				);
			}
		}
		const date2 = Date.now();
		console.log(`${(date2 - date1) / 1000}s`);
	}
}

export default new BotController();
