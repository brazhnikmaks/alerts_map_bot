import { config } from "dotenv";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

config();

class PuppeteerService {
	async getSelectorScreenshot(
		url: string,
		selector: string,
		evaluate: () => void,
	) {
		const browser = await puppeteer.launch({
			args: chromium.args,
			executablePath:
				process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
			headless: true,
		});
		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1920, height: 1080 });
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
