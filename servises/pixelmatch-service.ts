import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

class PixelmatchService {
	async diffImages(img1Buffer: Buffer, img2Buffer: Buffer) {
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
			{
				threshold: 0.1,
			},
		);

		return diffPixels;
	}
}

export default new PixelmatchService();
