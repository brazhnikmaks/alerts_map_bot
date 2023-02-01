"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telefram_service_1 = __importDefault(require("./servises/telefram-service"));
const bot_controller_1 = __importDefault(require("./controllers/bot-controller"));
telefram_service_1.default.on("message", bot_controller_1.default.onAction.bind(bot_controller_1.default));
setInterval(() => {
    bot_controller_1.default.monitor.bind(bot_controller_1.default)();
}, 30 * 1000);
// BotController.updateMessage.bind(BotController)();
