"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    id: { type: Number, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    subscribed: { type: Boolean, default: true },
    silent: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
});
exports.default = (0, mongoose_1.model)("Chat", ChatSchema);
