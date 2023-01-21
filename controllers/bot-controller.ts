import fs from "fs";
import {
	Message,
	SendMessageOptions,
	KeyboardButton,
} from "node-telegram-bot-api";
import bot from "../servises/telefram-service";
import db from "../servises/mongo-service";
import PuppeteerService from "../servises/puppeteer-service";
import PixelmatchService from "../servises/pixelmatch-service";
import ChatDto from "../dtos/chat-dto";

class BotController {
	constructor() {
		this.setCommands();
	}

	async setCommands() {
		bot.setMyCommands([
			{ command: "/legend", description: "ℹ️ Легенда" },
			{ command: "/subscribe", description: "🔔 Підписатися" },
			{ command: "/unsubscribe", description: "🔕 Відписатися" },
			{ command: "/mute", description: "🔇 Без звуку" },
			{ command: "/unmute", description: "🔈 Зі звуком" },
			{ command: "/help", description: "📄 Допомога" },
		]);
	}

	setReplyKeyboard(chat: ChatDto): SendMessageOptions {
		const { subscribed, silent } = chat;

		const keyboard: KeyboardButton[][] = [];

		keyboard.push(
			[
				{
					text: "ℹ️ Легенда",
				},
			],
			[
				{
					text: subscribed ? "🔕 Відписатися" : "🔔 Підписатися",
				},
				{
					text: silent ? "🔈 Зі звуком" : "🔇 Без звуку",
				},
			],
		);

		return {
			reply_markup: {
				resize_keyboard: true,
				keyboard,
			},
		};
	}

	async sendError(chatId: number) {
		await bot.sendMessage(chatId, `Помилочка  ¯\\_(ツ)_/¯`);
	}

	async onHelp(chatId: number) {
		return await bot.sendMessage(
			chatId,
			`Ви отримаєте нову мапу, коли на ній будуть зміни.\n\nОсь що Ви можете поки зробити:\n\n/legend - ℹ️ Подивитися легенду мапы.\n\n/unsubscribe - 🔕 *відписатися* від оновлень мапи.\n/subscribe - 🔔 *відновити* підписку.\n\n/mute - 🔇 налаштувати оповіщення *без звуку*.\n/unmute - 🔈 та *зі звуком*.`,
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
			from,
		} = msg;

		this.setCommands();

		try {
			const chat = await db.addChat(chatId, from);

			await bot.sendMessage(
				chatId,
				`Вітаю, Ви підписались на оновленя мапи тривог України (https://alerts.in.ua/).\nЦей бот моніторить зміни на мапі кожні 30 секунд і надсилає її, якщо щось змінилось.\nОсь як виглядає мапа зараз:`,
				{
					...this.setReplyKeyboard(chat),
					disable_web_page_preview: true,
				},
			);

			await bot.sendPhoto(
				chatId,
				fs.readFileSync("base.png"),
				{},
				{
					filename: "mapScreenshot",
					contentType: "image/png",
				},
			);

			return;
		} catch (e) {
			try {
				await this.setCommands();
				let chat = await db.getChat(chatId);
				const { subscribed } = chat;
				if (subscribed) {
					await bot.sendMessage(
						chatId,
						`Вітаю, ось як виглядає мапа зараз:`,
						this.setReplyKeyboard(chat),
					);
				} else {
					chat = await db.chatSubscribe(chatId, true);
					await bot.sendMessage(
						chatId,
						`Ви знову підписані на тривожну мапу. А ось і вона зараз:`,
						this.setReplyKeyboard(chat),
					);
				}

				await bot.sendPhoto(
					chatId,
					fs.readFileSync("base.png"),
					{},
					{
						filename: "mapScreenshot",
						contentType: "image/png",
					},
				);
			} catch (e) {
				await this.sendError(chatId);
			}
		}
	}

	async onLegend(msg: Message) {
		const {
			chat: { id: chatId },
		} = msg;

		const legend = fs.readFileSync("legend.png");

		return await bot.sendPhoto(
			chatId,
			legend,
			{},
			{
				filename: "mapLegend",
				contentType: "image/png",
			},
		);
	}

	async onSubscribe(msg: Message, subscribe: boolean) {
		const {
			chat: { id: chatId },
		} = msg;

		try {
			let chat = await db.getChat(chatId);

			if (chat.subscribed === subscribe) {
				return await bot.sendMessage(
					chatId,
					subscribe
						? "🔔 Ви вже підписані на щоденні передбачення."
						: "🔕 Ви вже відписані від щоденних передбачень",
					this.setReplyKeyboard(chat),
				);
			}

			chat = await db.chatSubscribe(chatId, subscribe);

			await bot.sendMessage(
				chatId,
				subscribe
					? "🔔 Ви підписалися на щоденні передбачення."
					: `🔕 Ви відписались від щоденних передбачень. Ви можете отримати передбачення в "Меню", але один раз на день.`,
				this.setReplyKeyboard(chat),
			);
			return;
		} catch (e) {
			await this.sendError(chatId);
		}
	}

	async onMute(msg: Message, mute: boolean) {
		const {
			chat: { id: chatId },
		} = msg;

		try {
			let chat = await db.getChat(chatId);

			if (chat.silent === mute) {
				return await bot.sendMessage(
					chatId,
					mute
						? "🔇 Ви вже отримуєте пердбачення без звуку"
						: "🔈 Ви вже отримуєте пердбачення зі звуком",
					this.setReplyKeyboard(chat),
				);
			}

			chat = await db.chatSilent(chatId, mute);

			await bot.sendMessage(
				chatId,
				mute
					? "🔇 Ваші пердбачення будуть надходити без звуку."
					: "🔈 Ваші пердбачення будуть надходити зі звуком.",
				this.setReplyKeyboard(chat),
			);

			return;
		} catch (e) {
			await this.sendError(chatId);
		}
	}

	async onAction(msg: Message) {
		let {
			text,
			chat: { id: chatId },
		} = msg;

		try {
			await db.connect();
			switch (text) {
				//start bot
				case "/start":
					await this.onStart(msg);
					return;
				//show legend
				case "/legend":
				case "ℹ️ Легенда":
					await this.onLegend(msg);
					return;
				//subscribe
				case "/subscribe":
				case "🔔 Підписатися":
					await this.onSubscribe(msg, true);
					return;
				//unsubscribe
				case "/unsubscribe":
				case "🔕 Відписатися":
					await this.onSubscribe(msg, false);
					return;
				//mute
				case "/mute":
				case "🔇 Без звуку":
					await this.onMute(msg, true);
					return;
				//unmute
				case "/unmute":
				case "🔈 Зі звуком":
					await this.onMute(msg, false);
					return;
				default:
					//help
					await this.onHelp(chatId);
					return;
			}
		} catch (e) {
			this.sendError(chatId);
		}
	}

	async startMonitoring() {
		let base = fs.readFileSync("base.png");

		setInterval(async () => {
			let diffPixels = 0;
			const newScreenshot = (await this.getAlertsScreenshot()) as Buffer;

			if (newScreenshot) {
				diffPixels = await PixelmatchService.diffImages(base, newScreenshot);

				console.log(`${diffPixels} pixels`);

				if (diffPixels > 400) {
					base = newScreenshot;
					fs.writeFileSync("base.png", newScreenshot);

					try {
						await db.connect();
						try {
							const chats = await db.getChats({
								subscribed: true,
							});

							if (!chats.length) {
								return;
							}

							await Promise.all(
								chats.map(async ({ id, silent }) => {
									return await bot.sendPhoto(
										id,
										newScreenshot,
										{
											disable_notification: silent,
										},
										{
											filename: "mapScreenshot",
											contentType: "image/png",
										},
									);
								}),
							);
						} catch (e) {}
					} catch (e) {}
				}
			}
		}, 30 * 1000);
	}
}

export default new BotController();
