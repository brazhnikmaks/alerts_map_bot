import { Handler } from "@netlify/functions";
import axios from "axios";
import bot from "../../servises/telefram-service";

const handler: Handler = async () => {
	await Promise.all([
		new Promise(() =>
			setTimeout(
				() =>
					axios(
						"https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/send",
					),
				8000,
			),
		),
		bot.sendMessage(436262107, new Date().toLocaleString()),
	]);
	return { statusCode: 200 };
};

export { handler };
