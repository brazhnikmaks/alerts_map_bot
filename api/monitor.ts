import type { VercelRequest, VercelResponse } from "@vercel/node";
import botController from "../controllers/bot-controller";

export default async (request: VercelRequest, response: VercelResponse) => {
	await Promise.all([
		botController.monitor.bind(botController)(),
		// new Promise(() =>
		// 	setTimeout(
		// 		() =>
		// 			axios(
		// 				"https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/delay",
		// 			),
		// 		9500,
		// 	),
		// ),
	]);
	response.status(200).send(`200`);
};
