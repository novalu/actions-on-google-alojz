import {ForecastProvider} from "../ForecastProvider";
import {City} from "../../../model/City";
import {parse} from "node-html-parser";
import {inject, injectable} from "inversify";
import {TYPES} from "../../../di/types";
import {NetworkRequest} from "../../../utils/network/NetworkRequest";
import {Logger} from "../../../utils/log/Logger";

@injectable()
class HtmlForecastProvider implements ForecastProvider {

    constructor(
        @inject(TYPES.NetworkRequest) private request: NetworkRequest,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    private readonly BASE_URL = "https://alojz.cz/";

    public buildUrl(city: City): string {
        return this.BASE_URL + city.getUrlName();
    }

    public async getHtmlFromUrl(city: City): Promise<string> {
        const url = this.buildUrl(city);
        const res = await this.request.get(url);
        return res.text;
    }

    public async getTodayForecast(city: City): Promise<string> {
        const html = await this.getHtmlFromUrl(city);
        const parsed = parse(html);
        const todayForecastNode = (parsed as any).querySelector(".actual-forecast");
        if (todayForecastNode) {
            return todayForecastNode.text.trim();
        } else {
            this.logger.warn("Cannot get today forecast");
            return undefined;
        }
    }

    public async getTomorrowForecast(city: City): Promise<string> {
        const html = await this.getHtmlFromUrl(city);
        const parsedHtml = parse(html);
        const tomorrowForecastNode = (parsedHtml as any).querySelector(".actual-forecast-day2");
        if (tomorrowForecastNode) {
            return tomorrowForecastNode.text.trim();
        } else {
            this.logger.warn("Cannot get tomorrow forecast");
            return undefined;
        }
    }

    public async getAnyForecast(city: City): Promise<string> {
        let forecast = await this.getTodayForecast(city);
        if (!forecast) {
           forecast = await this.getTomorrowForecast(city);
        }
        if (forecast) {
            return forecast;
        } else {
            this.logger.warn("Cannot get any forecast");
            return undefined;
        }
    }

}

export { HtmlForecastProvider }
