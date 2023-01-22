import { Handler } from "@netlify/functions";
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const handler: Handler = async () => {
	const browser = await puppeteer.launch({
		args: chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath(),
		headless: chromium.headless,
		ignoreHTTPSErrors: true,
	});

	const page = await browser.newPage();
	await page.goto("https://alerts.in.ua/");
	const pageTitle = await page.title();
	await browser.close();

	console.log(pageTitle);
	return { statusCode: 200 };
};

export { handler };
