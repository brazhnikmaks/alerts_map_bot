import { Handler } from "@netlify/functions";
import axios from "axios";
import bot from "../../servises/telefram-service";

const handler: Handler = async () => {
	await Promise.all([
		bot.sendMessage(436262107, new Date().toLocaleString()),
		new Promise(() =>
			setTimeout(
				() =>
					axios(
						"https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/delay",
					),
				9500,
			),
		),
		,
	]);
	return { statusCode: 200 };
};

export { handler };
