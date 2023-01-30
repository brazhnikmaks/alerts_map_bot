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
const pngjs_1 = require("pngjs");
// @ts-ignore
const pixelmatch_1 = __importDefault(require("pixelmatch"));
class PixelmatchService {
    diffImages(img1Buffer, img2Buffer, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const img1 = pngjs_1.PNG.sync.read(img1Buffer);
            const img2 = pngjs_1.PNG.sync.read(img2Buffer);
            const { width, height } = img1;
            const diff = new pngjs_1.PNG({ width, height });
            const diffPixels = (0, pixelmatch_1.default)(img1.data, img2.data, diff.data, width, height, options);
            return diffPixels;
        });
    }
}
exports.default = new PixelmatchService();
