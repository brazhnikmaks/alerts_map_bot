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
      page.setDefaultNavigationTimeout(0);
      await page.goto(url, { timeout: 0 });
      await page.evaluate(evaluate);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
      //sleep
      await new Promise((r) => setTimeout(r, 2000));
      await page.waitForSelector(selector, { timeout: 0 });
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
