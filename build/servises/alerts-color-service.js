"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlertsColorService {
    constructor() {
        this.noAlert = [24, 35, 50, 255];
        this.airAlert = [104, 24, 27, 255];
        this.communityAlert = [106, 31, 40, 255];
        this.artilleryAlert = [116, 70, 30, 255];
        this.artilleryAirAlert = [164, 64, 16, 255];
    }
    isAirAlert(color1, color2) {
        return ((color1[0] === this.noAlert[0] &&
            color1[1] === this.noAlert[1] &&
            color1[2] === this.noAlert[2] &&
            color1[3] === this.noAlert[3] &&
            ((color2[0] === this.airAlert[0] &&
                color2[1] === this.airAlert[1] &&
                color2[2] === this.airAlert[2] &&
                color2[3] === this.airAlert[3]) ||
                (color2[0] === this.communityAlert[0] &&
                    color2[1] === this.communityAlert[1] &&
                    color2[2] === this.communityAlert[2] &&
                    color2[3] === this.communityAlert[3]))) ||
            (color1[0] === this.airAlert[0] &&
                color1[1] === this.airAlert[1] &&
                color1[2] === this.airAlert[2] &&
                color1[3] === this.airAlert[3] &&
                ((color2[0] === this.noAlert[0] &&
                    color2[1] === this.noAlert[1] &&
                    color2[2] === this.noAlert[2] &&
                    color2[3] === this.noAlert[3]) ||
                    (color2[0] === this.communityAlert[0] &&
                        color2[1] === this.communityAlert[1] &&
                        color2[2] === this.communityAlert[2] &&
                        color2[3] === this.communityAlert[3]))) ||
            (color1[0] === this.communityAlert[0] &&
                color1[1] === this.communityAlert[1] &&
                color1[2] === this.communityAlert[2] &&
                color1[3] === this.communityAlert[3] &&
                ((color2[0] === this.noAlert[0] &&
                    color2[1] === this.noAlert[1] &&
                    color2[2] === this.noAlert[2] &&
                    color2[3] === this.noAlert[3]) ||
                    (color2[0] === this.airAlert[0] &&
                        color2[1] === this.airAlert[1] &&
                        color2[2] === this.airAlert[2] &&
                        color2[3] === this.airAlert[3]))));
    }
}
exports.default = new AlertsColorService();
