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
const alerts_color_service_1 = __importDefault(require("../servises/alerts-color-service"));
class BotController {
    constructor() {
        this.setCommands();
    }
    setCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            telefram_service_1.default.setMyCommands([
                { command: "/legend", description: "ℹ️ Легенда" },
                { command: "/air", description: "✈ Тільки повітряні тривоги" },
                { command: "/all", description: "⚠️ Всі види тривог" },
                { command: "/subscribe", description: "🔔 Підписатися" },
                { command: "/unsubscribe", description: "🔕 Відписатися" },
                { command: "/mute", description: "🔇 Без звуку" },
                { command: "/unmute", description: "🔈 Зі звуком" },
                { command: "/help", description: "📄 Допомога" },
            ]);
        });
    }
    setReplyKeyboard(chat) {
        const { subscribed, silent, alerts } = chat;
        const keyboard = [];
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
    sendError(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield telefram_service_1.default.sendMessage(chatId, `Помилочка  ¯\\_(ツ)_/¯`);
        });
    }
    onHelp(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield telefram_service_1.default.sendMessage(chatId, `Ви отримаєте нову мапу, коли на ній будуть зміни.\n\nОсь, що Ви можете поки зробити:\n\n/legend - ℹ️ Подивитися легенду мапы.\n\n/air - ✈ налаштувати оповіщення тільки *повітрянної тривоги*.\n/all - ⚠️ або налаштувати оповіщення будь-якої тривоги (повітряна, артилерія та інше).\n\n/unsubscribe - 🔕 *відписатися* від оновлень мапи.\n/subscribe - 🔔 *відновити* підписку.\n\n/mute - 🔇 налаштувати оповіщення *без звуку*.\n/unmute - 🔈 та *зі звуком*.`, {
                parse_mode: "Markdown",
            });
        });
    }
    getAlertsScreenshot() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://alerts.in.ua/";
            const selector = ".alert-map.map-container.no-select>svg>g[fill='none']";
            return yield puppeteer_service_1.default.getSelectorScreenshot(url, selector, () => {
                localStorage.setItem("darkMode", "true");
                localStorage.setItem("showDurationGradient", "false");
                localStorage.setItem("showOblastLabels", "true");
                localStorage.setItem("offlineWarning", "false");
                localStorage.setItem("showRaion", "null");
            });
        });
    }
    onStart(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, from, } = msg;
            this.setCommands();
            try {
                const chat = yield mongo_service_1.default.addChat(chatId, from);
                yield telefram_service_1.default.sendMessage(chatId, `Вітаю, Ви підписались на оновленя мапи тривог України (https://alerts.in.ua/).\n\nЦей бот моніторить зміни на мапі та надсилає її, якщо щось змінилось.\n\nКраще ввімкнути автовидалення повідомлень 1 раз на день. (навіщо Вам зберігати старі мапи)\n\nОсь як виглядає мапа зараз:`, Object.assign(Object.assign({}, this.setReplyKeyboard(chat)), { disable_web_page_preview: true }));
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
            const legend = fs_1.default.readFileSync("legend.jpeg");
            return yield telefram_service_1.default.sendPhoto(chatId, legend, {}, {
                filename: "mapLegend",
                contentType: "image/jpeg",
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
                        ? "🔔 Ви вже підписані на оновлення мапи."
                        : "🔕 Ви вже відписані від оновлень", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatSubscribe(chatId, subscribe);
                yield telefram_service_1.default.sendMessage(chatId, subscribe
                    ? "🔔 Ви підписалися на оновлення мапи.\nОсь вона зараз:"
                    : `🔕 Ви відписались від оновлень.`, this.setReplyKeyboard(chat));
                if (subscribe) {
                    yield telefram_service_1.default.sendPhoto(chatId, fs_1.default.readFileSync("base.png"), {}, {
                        filename: "mapScreenshot",
                        contentType: "image/png",
                    });
                }
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
                        ? "🔇 Ви вже отримуєте оповіщення без звуку"
                        : "🔈 Ви вже отримуєте оповіщення зі звуком", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatSilent(chatId, mute);
                yield telefram_service_1.default.sendMessage(chatId, mute
                    ? "🔇 Оповіщення будуть надходити без звуку."
                    : "🔈 Оповіщення будуть надходити зі звуком.", this.setReplyKeyboard(chat));
                return;
            }
            catch (e) {
                yield this.sendError(chatId);
            }
        });
    }
    onAirAlert(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, } = msg;
            try {
                let chat = yield mongo_service_1.default.getChat(chatId);
                if (chat.alerts === "air") {
                    return yield telefram_service_1.default.sendMessage(chatId, "✈ Ви вже отримуєте оновлення мапи тільки при зміні повітряної тривоги (червоний колір).", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatAlerts(chatId, "air");
                yield telefram_service_1.default.sendMessage(chatId, "✈ Оновлення мапи будуть надходити тільки якщо зміниться повітряна тривога (червоний колір).", this.setReplyKeyboard(chat));
                return;
            }
            catch (e) {
                yield this.sendError(chatId);
            }
        });
    }
    onAllAlert(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chat: { id: chatId }, } = msg;
            try {
                let chat = yield mongo_service_1.default.getChat(chatId);
                if (chat.alerts === "all") {
                    return yield telefram_service_1.default.sendMessage(chatId, "⚠️ Ви вже отримуєте оновлення мапи на будь-яку зміну тривог.", this.setReplyKeyboard(chat));
                }
                chat = yield mongo_service_1.default.chatAlerts(chatId, "all");
                yield telefram_service_1.default.sendMessage(chatId, "⚠️ Оновлення мапи будуть надходити при будь-якій зміні тривог.", this.setReplyKeyboard(chat));
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
                    case "ℹ️":
                        yield this.onLegend(msg);
                        return;
                    //show all alerts
                    case "/all":
                    case "⚠️":
                        yield this.onAllAlert(msg);
                        return;
                    //show only air alert
                    case "/air":
                    case "✈":
                        yield this.onAirAlert(msg);
                        return;
                    //subscribe
                    case "/subscribe":
                    case "🔔":
                        yield this.onSubscribe(msg, true);
                        return;
                    //unsubscribe
                    case "/unsubscribe":
                    case "🔕":
                        yield this.onSubscribe(msg, false);
                        return;
                    //mute
                    case "/mute":
                    case "🔇":
                        yield this.onMute(msg, true);
                        return;
                    //unmute
                    case "/unmute":
                    case "🔈":
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
            let airAlertMatch = false;
            if (newScreenshot) {
                const base = fs_1.default.readFileSync("base.png");
                const diffPixels = yield pixelmatch_service_1.default.diffImages(base, newScreenshot, {
                    threshold: 0.1,
                    // @ts-ignore
                    onDiffPixel: (color1, color2) => {
                        if (!airAlertMatch) {
                            airAlertMatch = alerts_color_service_1.default.isAirAlert(color1, color2);
                        }
                    },
                });
                if (diffPixels > 400) {
                    // catch not alert screenshots
                    if (!airAlertMatch) {
                        const dateNow = Date.now();
                        fs_1.default.writeFileSync(`base-before-${dateNow}.png`, base);
                        fs_1.default.writeFileSync(`base-after-${dateNow}.png`, newScreenshot);
                    }
                    fs_1.default.writeFileSync("base.png", newScreenshot);
                    try {
                        yield mongo_service_1.default.connect();
                        try {
                            const chats = yield mongo_service_1.default.getChats(Object.assign({ subscribed: true }, (airAlertMatch ? {} : { alerts: "all" })));
                            if (!chats.length) {
                                return;
                            }
                            yield Promise.all(chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                                const { id, silent } = chat;
                                try {
                                    yield telefram_service_1.default.sendPhoto(id, newScreenshot, Object.assign(Object.assign({}, this.setReplyKeyboard(chat)), { disable_notification: silent }), {
                                        filename: "mapScreenshot",
                                        contentType: "image/png",
                                    });
                                    return;
                                }
                                catch (e) {
                                    // @ts-ignore
                                    if (e.response.body.error_code === 403) {
                                        yield mongo_service_1.default.chatSubscribe(id, false);
                                    }
                                    return;
                                }
                            })));
                            console.log((airAlertMatch
                                ? "зміна повітряної тривоги"
                                : "зміна інших тривог") +
                                " " +
                                new Date(Date.now() + 120 * 60 * 1000).toLocaleString());
                        }
                        catch (e) { }
                    }
                    catch (e) { }
                }
            }
        });
    }
    updateMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mongo_service_1.default.connect();
                try {
                    const chats = yield mongo_service_1.default.getChats({
                        subscribed: true,
                    });
                    if (!chats.length) {
                        return;
                    }
                    yield Promise.all(chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                        const { id, silent } = chat;
                        try {
                            yield telefram_service_1.default.sendMessage(id, "Оновлення:\n\nБот навчився відрізняти повітряну тривогу (червоного кольору) від інших.\n\nТепер додатково Ви можете:\n\n/air - ✈ налаштувати оповіщення тільки *повітрянної тривоги*.\n/all - ⚠️ або налаштувати оповіщення будь-якої тривоги (повітряна, артилерія та інше). - за замовчуванням\n\nНаприклад, якщо Ви налаштували оповіщення тільки повітряної тривоги, бот нічого не відправить, якщо зміниться загроза артобстрілу.", Object.assign(Object.assign({}, this.setReplyKeyboard(chat)), { parse_mode: "Markdown" }));
                            return;
                        }
                        catch (e) { }
                    })));
                }
                catch (e) { }
            }
            catch (e) { }
        });
    }
}
exports.default = new BotController();
