import { PNG } from "pngjs";
// @ts-ignore
import pixelmatch, { PixelmatchOptions } from "pixelmatch";

class PixelmatchService {
	async diffImages(
		img1Buffer: Buffer,
		img2Buffer: Buffer,
		options: PixelmatchOptions,
	) {
		const img1 = PNG.sync.read(img1Buffer);
		const img2 = PNG.sync.read(img2Buffer);
		const { width, height } = img1;
		const diff = new PNG({ width, height });

		const diffPixels = pixelmatch(
			img1.data,
			img2.data,
			diff.data,
			width,
			height,
			options,
		);

		return diffPixels;
	}
}

export default new PixelmatchService();
