"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const telefram_service_1 = __importDefault(require("../servises/telefram-service"));
const mongo_service_1 = __importDefault(require("../servises/mongo-service"));
const puppeteer_service_1 = __importDefault(require("../servises/puppeteer-service"));
const pixelmatch_service_1 = __importDefault(require("../servises/pixelmatch-service"));
class BotController {
    constructor() {
        this.setCommands();
    }
    setCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            telefram_service_1.default.setMyCommands([
                { command: "/legend", description: "ℹ️ Легенда" },
                { command: "/subscribe", description: "🔔 Підписатися" },
                { command: "/unsubscribe", description: "🔕 Відписатися" },
                { command: "/mute", description: "🔇 Без звуку" },
                { command: "/unmute", description: "🔈 Зі звуком" },
                { command: "/help", description: "📄 Допомога" },
            ]);
        });
    }
    setReplyKeyboard(chat) {
        const { subscribed, silent } = chat;
        const keyboard = [];
        keyboard.push([
            {
                text: "ℹ️ Легенда",
            },
        ], [
            {
                text: subscribed ? "🔕 Відписатися" : "🔔 Підписатися",
            },
            {
                text: silent ? "🔈 Зі звуком" : "🔇 Без звуку",
            },
        ]);
        return {
            reply_markup: {
                resize_keyboard: true,
                keyboard,
            },
        };
    }
    sendError(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield telefram_service_1.default.sendMessage(chatId, `Помилочка  ¯\\_(ツ)_/¯`);
        });
    }
    onHelp(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield telefram_service_1.default.sendMessage(chatId, `Ви отримаєте нову мапу, коли на ній будуть зміни.\n\nОсь що Ви можете поки зробити:\n\n/legend - ℹ️ Подивитися легенду мапы.\n\n/unsubscribe - 🔕 *відписатися* від оновлень мапи.\n/subscribe - 🔔 *відновити* підписку.\n\n/mute - 🔇 налаштувати оповіщення *без звуку*.\n/unmute - 🔈 та *зі звуком*.`);
        });
    }
    getAlertsScreenshot() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://alerts.in.ua/";
            const selector = ".alert-map.map-container.no-select>svg>g[fill='none']";
            return yield puppeteer_service_1.default.getSelectorScreenshot(url, selector, () => {
                localStorage.setItem("darkMode", "true");
                localStorage.setItem("showDurationGradient", "true");
                localStorage.setItem("showOblastLabels", "true");
            });
        });
    }
    onStart(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, from, } = msg;
            this.setCommands();
            try {
                const chat = yield mongo_service_1.default.addChat(chatId, from);
                yield telefram_service_1.default.sendMessage(chatId, `Вітаю, Ви підписались на оновленя мапи тривог України (https://alerts.in.ua/).\nЦей бот моніторить зміни на мапі кожні 30 секунд і надсилає її, якщо щось змінилось.\nОсь як виглядає мапа зараз:`, Object.assign(Object.assign({}, this.setReplyKeyboard(chat)), { disable_web_page_preview: true }));
                yield telefram_service_1.default.sendPhoto(chatId, fs_1.default.readFileSync("base.png"), {}, {
                    filename: "mapScreenshot",
                    contentType: "image/png",
                });
                return;
            }
            catch (e) {
                try {
                    yield this.setCommands();
                    let chat = yield mongo_service_1.default.getChat(chatId);
                    const { subscribed } = chat;
                    if (subscribed) {
                        yield telefram_service_1.default.sendMessage(chatId, `Вітаю, ось як виглядає мапа зараз:`, this.setReplyKeyboard(chat));
                    }
                    else {
                        chat = yield mongo_service_1.default.chatSubscribe(chatId, true);
                        yield telefram_service_1.default.sendMessage(chatId, `Ви знову підписані на тривожну мапу. А ось і вона зараз:`, this.setReplyKeyboard(chat));
                    }
                    yield telefram_service_1.default.sendPhoto(chatId, fs_1.default.readFileSync("base.png"), {}, {
                        filename: "mapScreenshot",
                        contentType: "image/png",
                    });
                }
                catch (e) {
                    yield this.sendError(chatId);
                }
            }
        });
    }
    onLegend(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, } = msg;
            const legend = fs_1.default.readFileSync("legend.png");
            return yield telefram_service_1.default.sendPhoto(chatId, legend, {}, {
                filename: "mapLegend",
                contentType: "image/png",
            });
        });
    }
    onSubscribe(msg, subscribe) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, } = msg;
            try {
                let chat = yield mongo_service_1.default.getChat(chatId);
                if (chat.subscribed === subscribe) {
                    return yield telefram_service_1.default.sendMessage(chatId, subscribe
                        ? "🔔 Ви вже підписані на щоденні передбачення."
                        : "🔕 Ви вже відписані від щоденних передбачень", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatSubscribe(chatId, subscribe);
                yield telefram_service_1.default.sendMessage(chatId, subscribe
                    ? "🔔 Ви підписалися на щоденні передбачення."
                    : `🔕 Ви відписались від щоденних передбачень. Ви можете отримати передбачення в "Меню", але один раз на день.`, this.setReplyKeyboard(chat));
                return;
            }
            catch (e) {
                yield this.sendError(chatId);
            }
        });
    }
    onMute(msg, mute) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, } = msg;
            try {
                let chat = yield mongo_service_1.default.getChat(chatId);
                if (chat.silent === mute) {
                    return yield telefram_service_1.default.sendMessage(chatId, mute
                        ? "🔇 Ви вже отримуєте пердбачення без звуку"
                        : "🔈 Ви вже отримуєте пердбачення зі звуком", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatSilent(chatId, mute);
                yield telefram_service_1.default.sendMessage(chatId, mute
                    ? "🔇 Ваші пердбачення будуть надходити без звуку."
                    : "🔈 Ваші пердбачення будуть надходити зі звуком.", this.setReplyKeyboard(chat));
                return;
            }
            catch (e) {
                yield this.sendError(chatId);
            }
        });
    }
    onAction(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let { text, chat: { id: chatId }, } = msg;
            try {
                yield mongo_service_1.default.connect();
                switch (text) {
                    //start bot
                    case "/start":
                        yield this.onStart(msg);
                        return;
                    //show legend
                    case "/legend":
                    case "ℹ️ Легенда":
                        yield this.onLegend(msg);
                        return;
                    //subscribe
                    case "/subscribe":
                    case "🔔 Підписатися":
                        yield this.onSubscribe(msg, true);
                        return;
                    //unsubscribe
                    case "/unsubscribe":
                    case "🔕 Відписатися":
                        yield this.onSubscribe(msg, false);
                        return;
                    //mute
                    case "/mute":
                    case "🔇 Без звуку":
                        yield this.onMute(msg, true);
                        return;
                    //unmute
                    case "/unmute":
                    case "🔈 Зі звуком":
                        yield this.onMute(msg, false);
                        return;
                    default:
                        //help
                        yield this.onHelp(chatId);
                        return;
                }
            }
            catch (e) {
                this.sendError(chatId);
            }
        });
    }
    monitor() {
        return __awaiter(this, void 0, void 0, function* () {
            const newScreenshot = (yield this.getAlertsScreenshot());
            if (newScreenshot) {
                const diffPixels = yield pixelmatch_service_1.default.diffImages(fs_1.default.readFileSync("base.png"), newScreenshot);
                console.log(`${diffPixels} pixels; ${new Date().toLocaleString()}`);
                if (diffPixels > 400) {
                    fs_1.default.writeFileSync("base.png", newScreenshot);
                    try {
                        yield mongo_service_1.default.connect();
                        try {
                            const chats = yield mongo_service_1.default.getChats({
                                subscribed: true,
                            });
                            if (!chats.length) {
                                return;
                            }
                            yield Promise.all(chats.map(({ id, silent }) => __awaiter(this, void 0, void 0, function* () {
                                return yield telefram_service_1.default.sendPhoto(id, newScreenshot, {
                                    disable_notification: silent,
                                }, {
                                    filename: "mapScreenshot",
                                    contentType: "image/png",
                                });
                            })));
                        }
                        catch (e) { }
                    }
                    catch (e) { }
                }
            }
        });
    }
}
exports.default = new BotController();
