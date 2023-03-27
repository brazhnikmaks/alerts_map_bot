"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
(0, dotenv_1.config)();
class PuppeteerService {
    getSelectorScreenshot(url, selector, evaluate) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_core_1.default.launch({
                args: ["--no-sandbox", "--incognito"],
                userDataDir: "/dev/null",
                defaultViewport: { width: 1920, height: 1080 },
                executablePath: process.env.CHROME_EXECUTABLE_PATH,
                headless: true,
                ignoreHTTPSErrors: true,
            });
            try {
                const page = yield browser.newPage();
                yield page.setCacheEnabled(false);
                yield page.goto(url);
                yield page.evaluate(evaluate);
                yield page.goto(url, { waitUntil: "networkidle0" });
                //sleep
                yield new Promise((r) => setTimeout(r, 2000));
                yield page.waitForSelector(selector);
                const element = yield page.$(selector);
                if (element) {
                    return yield element.screenshot();
                }
            }
            catch (e) {
                return null;
            }
            finally {
                yield browser.close();
            }
        });
    }
}
exports.default = new PuppeteerService();
