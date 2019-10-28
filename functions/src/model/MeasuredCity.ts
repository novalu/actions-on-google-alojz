import {City} from "./City";
import {LatLng} from "./LatLng";

class MeasuredCity extends City {
    constructor(
        name: string,
        location: LatLng,
        public distanceInMeters: number
    ) {
        super(name, location)
    }
}

export { MeasuredCity }
