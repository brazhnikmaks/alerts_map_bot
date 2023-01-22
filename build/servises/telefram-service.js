"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// @ts-ignore
process.env["NTBA_FIX_350"] = 1;
const botOptions = { polling: true };
const bot = new node_telegram_bot_api_1.default(process.env.BOT_TOKEN, process.env.NODE_ENV === "development" ? botOptions : undefined);
exports.default = bot;
