import {City} from "../../model/City";

interface CitiesStorage {

    getCities(): City[]

    getCityForName(name: string): City

}

export { CitiesStorage }
