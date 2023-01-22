import { config } from "dotenv";
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

config();

class PuppeteerService {
	async getSelectorScreenshot(
		url: string,
		selector: string,
		evaluate: () => void,
	) {
		const browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: { width: 1920, height: 1080 },
			executablePath:
				process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
			headless: chromium.headless,
		});

		try {
			const page = await browser.newPage();
			await page.goto(url);
			await page.evaluate(evaluate);
			await page.goto(url, { waitUntil: "networkidle0" });
			await page.waitForSelector(selector);

			const element = await page.$(selector);

			if (element) {
				return await element.screenshot();
			}
		} catch (e) {
			console.log(e);
		} finally {
			await browser.close();
		}
	}
}

export default new PuppeteerService();
