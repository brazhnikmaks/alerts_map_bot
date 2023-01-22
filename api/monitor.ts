import type { VercelRequest, VercelResponse } from "@vercel/node";
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

export default async (request: VercelRequest, response: VercelResponse) => {
	console.log(await chromium.executablePath());
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
	response.status(200).send(`200`);
};
