import { Handler } from "@netlify/functions";
import axios from "axios";

const handler: Handler = async () => {
	await new Promise(() =>
		setTimeout(
			() =>
				axios(
					"https://alerts-map-bot-a6c83d.netlify.app/.netlify/functions/send",
				),
			9500,
		),
	);

	return { statusCode: 200 };
};

export { handler };
