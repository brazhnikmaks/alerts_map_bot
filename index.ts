import bot from "./servises/telefram-service";
import BotController from "./controllers/bot-controller";

bot.on("message", BotController.onAction.bind(BotController));

setInterval(() => {
	BotController.processDiff.bind(BotController)();
}, 30 * 1000);
