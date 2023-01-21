import { Handler } from "@netlify/functions";
import botController from "../../controllers/bot-controller";
// import axios from "axios";

const handler: Handler = async () => {
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
	return { statusCode: 200 };
};

export { handler };
