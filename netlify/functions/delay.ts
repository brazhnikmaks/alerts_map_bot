import { Handler } from "@netlify/functions";
import bot from "../../servises/telefram-service";

const handler: Handler = async () => {
	await new Promise(() =>
		setTimeout(
			() =>
				fetch(
					"https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/send",
				),
			8000,
		),
	);

	return { statusCode: 200 };
};

export { handler };
