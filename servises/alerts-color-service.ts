export type AlertColorType = [number, number, number, number];
export type AlertMultiColorType = [number[], number[], number[], number[]];

class AlertsColorService {
	noAlert: AlertMultiColorType;
	airAlert: AlertMultiColorType;
	artilleryAlert: AlertMultiColorType;
	communityAlert: AlertMultiColorType;
	artilleryAirAlert: AlertMultiColorType;

	constructor() {
		this.noAlert = [[24, 23], [34, 35], [50, 49, 51], [255]];
		this.airAlert = [[104, 94, 93], [24, 23, 22], [27, 26], [255]];
		this.communityAlert = [[106], [31], [40], [255]];
		this.artilleryAlert = [[116], [70], [30], [255]];
		this.artilleryAirAlert = [[164], [64], [16], [255]];
	}

	hasColor(multiColor: AlertMultiColorType, color: AlertColorType): boolean {
		return (
			multiColor[0].some((c) => c === color[0]) &&
			multiColor[1].some((c) => c === color[1]) &&
			multiColor[2].some((c) => c === color[2]) &&
			multiColor[3].some((c) => c === color[3])
		);
	}

	isAirAlert(color1: AlertColorType, color2: AlertColorType): boolean {
		const color1IsNoAlert = this.hasColor(this.noAlert, color1);
		const color2IsNoAlert = this.hasColor(this.noAlert, color2);

		const color1IsAirAlert = this.hasColor(this.airAlert, color1);
		const color2IsAirAlert = this.hasColor(this.airAlert, color2);

		const color1IsCommunityAlert = this.hasColor(this.communityAlert, color1);
		const color2IsCommunityAlert = this.hasColor(this.communityAlert, color2);

		return (
			(color1IsNoAlert && (color2IsAirAlert || color2IsCommunityAlert)) ||
			(color1IsAirAlert && (color2IsNoAlert || color2IsCommunityAlert)) ||
			(color1IsCommunityAlert && (color2IsNoAlert || color2IsAirAlert))
		);
	}
}

export default new AlertsColorService();
