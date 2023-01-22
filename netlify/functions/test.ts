import { Handler } from "@netlify/functions";
import puppeteer from "puppeteer-serverless";

const handler: Handler = async () => {
	// @ts-ignore
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://alerts.in.ua/");
	const pageTitle = await page.title();
	await browser.close();

	console.log(pageTitle);
	return { statusCode: 200 };
};

export { handler };
