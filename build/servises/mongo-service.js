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
const dotenv_1 = require("dotenv");
const mongoose_1 = __importDefault(require("mongoose"));
const chat_model_1 = __importDefault(require("../models/chat-model"));
const chat_dto_1 = __importDefault(require("../dtos/chat-dto"));
(0, dotenv_1.config)();
mongoose_1.default.set("strictQuery", false);
class MongoService {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connect = yield mongoose_1.default.connect(process.env.MONGO_DB_URL);
                return connect;
            }
            catch (err) {
                console.log("Failed to connect to DB", err);
            }
        });
    }
    getChats(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const chats = yield chat_model_1.default.find(filter);
            if (!chats.length) {
                throw new Error("No chats founded");
            }
            return chats.map((chat) => new chat_dto_1.default(chat));
        });
    }
    getChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield chat_model_1.default.findOne({ id: chatId });
            if (!chat) {
                throw new Error("No chat founded");
            }
            return new chat_dto_1.default(chat);
        });
    }
    addChat(chatId, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield chat_model_1.default.create({
                id: chatId,
                firstName: from === null || from === void 0 ? void 0 : from.first_name,
                lastName: from === null || from === void 0 ? void 0 : from.last_name,
                username: from === null || from === void 0 ? void 0 : from.username,
            });
            return new chat_dto_1.default(chat);
        });
    }
    chatSilent(chatId, silent) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield chat_model_1.default.findOneAndUpdate({ id: chatId }, {
                silent,
            }, {
                new: true,
            });
            if (!chat) {
                throw new Error("No chat founded");
            }
            return new chat_dto_1.default(chat);
        });
    }
    chatSubscribe(chatId, subscribed) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield chat_model_1.default.findOneAndUpdate({ id: chatId }, {
                subscribed,
            }, {
                new: true,
            });
            if (!chat) {
                throw new Error("No chat founded");
            }
            return new chat_dto_1.default(chat);
        });
    }
}
exports.default = new MongoService();
