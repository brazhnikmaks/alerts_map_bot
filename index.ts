import bot from "./servises/telefram-service";
import BotController from "./controllers/bot-controller";

bot.on("message", BotController.onAction.bind(BotController));

setInterval(() => {
	BotController.monitor.bind(BotController)();
}, 30 * 1000);

// BotController.updateMessage.bind(BotController)();
