import { Handler } from "@netlify/functions";
import bot from "../../servises/telefram-service";

const handler: Handler = async () => {
	setTimeout(() => {
		fetch("https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/delay");
	}, 8000);

	await bot.sendMessage(436262107, new Date().toLocaleString());
	return { statusCode: 200 };
};

export { handler };
