import { config } from "dotenv";
import puppeteer from "puppeteer-core";

config();

class PuppeteerService {
  async getSelectorScreenshot(
    url: string,
    selector: string,
    evaluate: () => void,
  ) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--incognito"],
      userDataDir: "/dev/null",
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
      headless: true,
      ignoreHTTPSErrors: true,
    });
    try {
      const page = await browser.newPage();
      await page.setCacheEnabled(false);
      await page.goto(url);
      await page.evaluate(evaluate);
      await page.goto(url, { waitUntil: "networkidle0" });
      //sleep
      await new Promise((r) => setTimeout(r, 2000));
      await page.waitForSelector(selector);
      const element = await page.$(selector);

      if (element) {
        return await element.screenshot();
      }
    } catch (e) {
      return null;
    } finally {
      await browser.close();
    }
  }
}

export default new PuppeteerService();
