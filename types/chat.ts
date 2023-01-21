export interface IChat {
	id: number;
	createdAt: Date;
	subscribed: boolean;
	silent: boolean;
	firstName?: string;
	lastName?: string;
	username?: string;
}
