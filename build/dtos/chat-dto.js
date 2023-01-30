"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatDto {
    constructor(model) {
        this.id = model.id;
        this.createdAt = model.createdAt;
        this.subscribed = model.subscribed;
        this.silent = model.silent;
        this.alerts = model.alerts;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.username = model.username;
    }
}
exports.default = ChatDto;
