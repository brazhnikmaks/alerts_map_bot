import TelegramApi from "node-telegram-bot-api";
import { config } from "dotenv";

config();

// @ts-ignore
process.env["NTBA_FIX_350"] = 1;

const botOptions = { polling: true };

const bot = new TelegramApi(
	process.env.BOT_TOKEN as string,
	process.env.NODE_ENV === "development" ? botOptions : undefined,
);

export default bot;
