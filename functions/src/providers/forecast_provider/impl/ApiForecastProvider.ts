import {inject, injectable} from "inversify";
import {ForecastProvider} from "../ForecastProvider";
import {TYPES} from "../../../di/types";
import {NetworkRequest} from "../../../utils/network/NetworkRequest";
import { City } from "../../../model/City";
import lodash from "lodash";
import moment from "moment";
import {TimeUtils} from "../../../utils/TimeUtils";
import {Logger} from "../../../utils/log/Logger";
import {AlojzManager} from "../../../managers/AlojzManager";

@injectable()
class ApiForecastProvider implements ForecastProvider {

    constructor(
        @inject(TYPES.NetworkRequest) private networkRequest: NetworkRequest,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    private readonly BASE_URL = "https://alojz.cz/api/v1/solution?url_id=/";

    private getUrlForCity(city: City): string {
        return this.BASE_URL + city.getUrlName();
    }

    private async getForecasts(city: City, day: number): Promise<string> {
        const response = await this.networkRequest.getJson(this.getUrlForCity(city));
        if (response.body && response.body.code === 200) {
            const days = [ response.body.day1, response.body.day2 ];
            const requestedDays = lodash.filter(days, (i) => {
                const today = TimeUtils.momentTz();
                const tomorrow = TimeUtils.momentTz().add(1, "d");
                if (day === AlojzManager.REQ_DAY_TODAY) {
                    return i && i.date === today.format("YYYY-MM-DD");
                } else if (day === AlojzManager.REQ_DAY_TOMORROW) {
                    return i && i.date === tomorrow.format("YYYY-MM-DD");
                } else if (day === AlojzManager.REQ_DAY_ANY) {
                    return i && (i.date === today.format("YYYY-MM-DD") || i.date === tomorrow.format("YYYY-MM-DD"));
                }
                return false;
            });
            if (requestedDays.length > 0) {
                return requestedDays[0].string;
            } else {
                this.logger.warn("Didn't find requested day");
                return undefined;
            }
        } else {
            throw new Error("No response body from API");
        }
    }

    public getTodayForecast(city: City): Promise<string> {
        return this.getForecasts(city, AlojzManager.REQ_DAY_TODAY);
    }

    public getTomorrowForecast(city: City): Promise<string> {
        return this.getForecasts(city, AlojzManager.REQ_DAY_TOMORROW);
    }

    public getAnyForecast(city: City): Promise<string> {
        return this.getForecasts(city, AlojzManager.REQ_DAY_ANY);
    }

}

export { ApiForecastProvider }
