export type AlertsType = "all" | "air" | "artillery";

export interface IChat {
	id: number;
	createdAt: Date;
	subscribed: boolean;
	silent: boolean;
	alerts: AlertsType;
	firstName?: string;
	lastName?: string;
	username?: string;
}
