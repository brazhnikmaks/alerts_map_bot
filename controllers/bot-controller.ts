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
import AlertsColorService from "../servises/alerts-color-service";
import ChatDto from "../dtos/chat-dto";

class BotController {
  constructor() {
    this.setCommands();
  }

  async setCommands() {
    bot.setMyCommands([
      { command: "/legend", description: "ℹ️ Легенда" },
      { command: "/air", description: "✈ Тільки повітряні тривоги" },
      { command: "/all", description: "⚠️ Всі види тривог" },
      { command: "/subscribe", description: "🔔 Підписатися" },
      { command: "/unsubscribe", description: "🔕 Відписатися" },
      { command: "/mute", description: "🔇 Без звуку" },
      { command: "/unmute", description: "🔈 Зі звуком" },
      { command: "/help", description: "📄 Допомога" },
    ]);
  }

  setReplyKeyboard(chat: ChatDto): SendMessageOptions {
    const { subscribed, silent, alerts } = chat;

    const keyboard: KeyboardButton[][] = [];

    keyboard.push([
      {
        text: "ℹ️",
      },
      {
        text: subscribed ? "🔕" : "🔔",
      },
      {
        text: silent ? "🔈" : "🔇",
      },
      {
        text: alerts === "air" ? "⚠️" : "✈",
      },
    ]);

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
      `Ви отримаєте нову мапу, коли на ній будуть зміни.\n\nОсь, що Ви можете поки зробити:\n\n/legend - ℹ️ Подивитися легенду мапы.\n\n/air - ✈ налаштувати оповіщення тільки *повітрянної тривоги*.\n/all - ⚠️ або налаштувати оповіщення будь-якої тривоги (повітряна, артилерія та інше).\n\n/unsubscribe - 🔕 *відписатися* від оновлень мапи.\n/subscribe - 🔔 *відновити* підписку.\n\n/mute - 🔇 налаштувати оповіщення *без звуку*.\n/unmute - 🔈 та *зі звуком*.`,
      {
        parse_mode: "Markdown",
      },
    );
  }

  async getAlertsScreenshot() {
    const url = "https://alerts.in.ua/";
    const selector = ".alert-map.map-container.no-select>svg>g[fill='none']";

    return await PuppeteerService.getSelectorScreenshot(url, selector, () => {
      localStorage.setItem("darkMode", "true");
      localStorage.setItem("showDurationGradient", "false");
      localStorage.setItem("showOblastLabels", "true");
      localStorage.setItem("offlineWarning", "false");
      localStorage.setItem("showRaion", "null");
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
        `Вітаю, Ви підписались на оновленя мапи тривог України (https://alerts.in.ua/).\n\nЦей бот моніторить зміни на мапі та надсилає її, якщо щось змінилось.\n\nКраще ввімкнути автовидалення повідомлень 1 раз на день. (навіщо Вам зберігати старі мапи)\n\nОсь як виглядає мапа зараз:`,
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

    const legend = fs.readFileSync("legend.jpeg");

    return await bot.sendPhoto(
      chatId,
      legend,
      {},
      {
        filename: "mapLegend",
        contentType: "image/jpeg",
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
            ? "🔔 Ви вже підписані на оновлення мапи."
            : "🔕 Ви вже відписані від оновлень",
          this.setReplyKeyboard(chat),
        );
      }

      chat = await db.chatSubscribe(chatId, subscribe);

      await bot.sendMessage(
        chatId,
        subscribe
          ? "🔔 Ви підписалися на оновлення мапи.\nОсь вона зараз:"
          : `🔕 Ви відписались від оновлень.`,
        this.setReplyKeyboard(chat),
      );

      if (subscribe) {
        await bot.sendPhoto(
          chatId,
          fs.readFileSync("base.png"),
          {},
          {
            filename: "mapScreenshot",
            contentType: "image/png",
          },
        );
      }

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
            ? "🔇 Ви вже отримуєте оповіщення без звуку"
            : "🔈 Ви вже отримуєте оповіщення зі звуком",
          this.setReplyKeyboard(chat),
        );
      }

      chat = await db.chatSilent(chatId, mute);

      await bot.sendMessage(
        chatId,
        mute
          ? "🔇 Оповіщення будуть надходити без звуку."
          : "🔈 Оповіщення будуть надходити зі звуком.",
        this.setReplyKeyboard(chat),
      );

      return;
    } catch (e) {
      await this.sendError(chatId);
    }
  }

  async onAirAlert(msg: Message) {
    const {
      chat: { id: chatId },
    } = msg;

    try {
      let chat = await db.getChat(chatId);

      if (chat.alerts === "air") {
        return await bot.sendMessage(
          chatId,
          "✈ Ви вже отримуєте оновлення мапи тільки при зміні повітряної тривоги (червоний колір).",
          this.setReplyKeyboard(chat),
        );
      }

      chat = await db.chatAlerts(chatId, "air");

      await bot.sendMessage(
        chatId,
        "✈ Оновлення мапи будуть надходити тільки якщо зміниться повітряна тривога (червоний колір).",
        this.setReplyKeyboard(chat),
      );

      return;
    } catch (e) {
      await this.sendError(chatId);
    }
  }

  async onAllAlert(msg: Message) {
    const {
      chat: { id: chatId },
    } = msg;

    try {
      let chat = await db.getChat(chatId);

      if (chat.alerts === "all") {
        return await bot.sendMessage(
          chatId,
          "⚠️ Ви вже отримуєте оновлення мапи на будь-яку зміну тривог.",
          this.setReplyKeyboard(chat),
        );
      }

      chat = await db.chatAlerts(chatId, "all");

      await bot.sendMessage(
        chatId,
        "⚠️ Оновлення мапи будуть надходити при будь-якій зміні тривог.",
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
        case "ℹ️":
          await this.onLegend(msg);
          return;
        //show all alerts
        case "/all":
        case "⚠️":
          await this.onAllAlert(msg);
          return;
        //show only air alert
        case "/air":
        case "✈":
          await this.onAirAlert(msg);
          return;
        //subscribe
        case "/subscribe":
        case "🔔":
          await this.onSubscribe(msg, true);
          return;
        //unsubscribe
        case "/unsubscribe":
        case "🔕":
          await this.onSubscribe(msg, false);
          return;
        //mute
        case "/mute":
        case "🔇":
          await this.onMute(msg, true);
          return;
        //unmute
        case "/unmute":
        case "🔈":
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

  async sendMap(map: Buffer, isAir: boolean) {
    fs.writeFileSync("base.png", map);

    try {
      await db.connect();
      try {
        const chats = await db.getChats({
          subscribed: true,
          ...(isAir ? {} : { alerts: "all" }),
        });

        if (!chats.length) {
          return;
        }

        await Promise.all(
          chats.map(async (chat) => {
            const { id, silent } = chat;
            try {
              await bot.sendPhoto(
                id,
                map,
                {
                  ...this.setReplyKeyboard(chat),
                  disable_notification: silent,
                },
                {
                  filename: "mapScreenshot",
                  contentType: "image/png",
                },
              );
              return;
            } catch (e) {
              // @ts-ignore
              if (e.response.body.error_code === 403) {
                await db.chatSubscribe(id, false);
              }
              return;
            }
          }),
        );
        console.log(
          (isAir ? "зміна повітряної тривоги" : "зміна інших тривог") +
            " " +
            new Date(Date.now() + 120 * 60 * 1000).toLocaleString(),
        );
      } catch (e) {}
    } catch (e) {}
  }

  async monitor() {
    const newScreenshot = (await this.getAlertsScreenshot()) as Buffer;
    let airAlertMatch = false;

    if (newScreenshot) {
      try {
        const base = fs.readFileSync("base.png");

        const diffPixels = await PixelmatchService.diffImages(
          base,
          newScreenshot,
          {
            threshold: 0.1,
            // @ts-ignore
            onDiffPixel: (color1, color2) => {
              if (!airAlertMatch) {
                airAlertMatch = AlertsColorService.isAirAlert(color1, color2);
              }
            },
          },
        );

        console.log(`${diffPixels} pixels; ${new Date().toLocaleString()}`);

        if (diffPixels > 400) {
          this.sendMap(newScreenshot, airAlertMatch);
        }
      } catch (e) {
        this.sendMap(newScreenshot, airAlertMatch);
      }
    }
  }

  // async updateMessage() {
  // 	try {
  // 		await db.connect();
  // 		try {
  // 			const chats = await db.getChats({
  // 				subscribed: true,
  // 			});

  // 			if (!chats.length) {
  // 				return;
  // 			}

  // 			await Promise.all(
  // 				chats.map(async (chat) => {
  // 					const { id, silent } = chat;
  // 					try {
  // 						await bot.sendMessage(
  // 							id,
  // 							"Оновлення:\n\nБот навчився відрізняти повітряну тривогу (червоного кольору) від інших.\n\nТепер додатково Ви можете:\n\n/air - ✈ налаштувати оповіщення тільки *повітрянної тривоги*.\n/all - ⚠️ або налаштувати оповіщення будь-якої тривоги (повітряна, артилерія та інше). - за замовчуванням\n\nНаприклад, якщо Ви налаштували оповіщення тільки повітряної тривоги, бот нічого не відправить, якщо зміниться загроза артобстрілу.",
  // 							{ ...this.setReplyKeyboard(chat), parse_mode: "Markdown" },
  // 						);
  // 						return;
  // 					} catch (e) {}
  // 				}),
  // 			);
  // 		} catch (e) {}
  // 	} catch (e) {}
  // }
}

export default new BotController();
