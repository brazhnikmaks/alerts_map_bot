import { Handler, schedule } from "@netlify/functions";
import botController from "../../controllers/bot-controller";

const monitorHandler: Handler = async () => {
	await botController.monitor.bind(botController)();

	return { statusCode: 200 };
};

const handler = schedule("15 * * * *", monitorHandler);

export { handler };
