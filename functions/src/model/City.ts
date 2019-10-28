import * as changeCase from "change-case"
import removeAccents from "remove-accents";
import {LatLng} from "./LatLng";

class City {
    constructor(
        public name: string,
        public location: LatLng
    ) {}

    public getUrlName(): string {
        const noAccents = removeAccents(this.name);
        return changeCase.param(noAccents);
    }
}

export { City }
