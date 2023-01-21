import { HydratedDocument } from "mongoose";
import { IChat } from "../types/chat";

class ChatDto implements IChat {
	id: number;
	createdAt: Date;
	subscribed: boolean;
	silent: boolean;
	firstName?: string;
	lastName?: string;
	username?: string;

	constructor(model: HydratedDocument<IChat>) {
		this.id = model.id;
		this.createdAt = model.createdAt;
		this.subscribed = model.subscribed;
		this.silent = model.silent;
		this.firstName = model.firstName;
		this.lastName = model.lastName;
		this.username = model.username;
	}
}

export default ChatDto;
