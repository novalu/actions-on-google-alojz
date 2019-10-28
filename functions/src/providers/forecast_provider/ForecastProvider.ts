import {City} from "../../model/City";

interface ForecastProvider {

    getAnyForecast(city: City): Promise<string>
    getTodayForecast(city: City): Promise<string>
    getTomorrowForecast(city: City): Promise<string>

}

export { ForecastProvider }
