import {inject, injectable} from "inversify";
import {City} from "../model/City";
import {TYPES} from "../di/types";
import {Logger} from "../utils/log/Logger";
import translate from "@vitalets/google-translate-api";
import {SpeechForecast} from "../model/SpeechForecast";
import {ForecastProvider} from "../providers/forecast_provider/ForecastProvider";
import {Forecast} from "../model/Forecast";
import {VoiceProvider} from "../providers/voice_provider/VoiceProvider";

@injectable()
class AlojzManager {

    public static readonly REQ_DAY_TODAY = 1;
    public static readonly REQ_DAY_TOMORROW = 2;
    public static readonly REQ_DAY_ANY = 3;

    public static readonly REQ_LANG_CZECH = 1;
    public static readonly REQ_LANG_ENGLISH = 2;

    constructor(
        @inject(TYPES.ForecastProvider) private forecastProvider: ForecastProvider,
        @inject(TYPES.VoiceProvider) private voiceProvider: VoiceProvider,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    private async getSpeechCzechForecast(forecastText: string): Promise<SpeechForecast> {
        const speechUrl = await this.voiceProvider.getSpeechUrl(forecastText);
        return new SpeechForecast(
            forecastText,
            Forecast.LANG_CZECH,
            speechUrl
        );
    }

    private async getTranslatedEnglishForecast(forecastText: string): Promise<Forecast> {
        const translated = await translate(forecastText, {from: "cs", to: "en"});
        return new Forecast(
            translated.text,
            Forecast.LANG_ENGLISH);
    }

    private async getForecastTextAt(city: City, reqDay: number): Promise<string> {
        switch (reqDay) {
            case AlojzManager.REQ_DAY_TODAY: return this.forecastProvider.getTodayForecast(city);
            case AlojzManager.REQ_DAY_TOMORROW: return this.forecastProvider.getTomorrowForecast(city);
            case AlojzManager.REQ_DAY_ANY: return this.forecastProvider.getAnyForecast(city);
            default: this.logger.warn("Unknown day request");
        }
        return undefined;
    }

    private async getForecastInLanguage(forecastText: string, reqLang: number): Promise<Forecast> {
        switch (reqLang) {
            case AlojzManager.REQ_LANG_CZECH: return this.getSpeechCzechForecast(forecastText);
            case AlojzManager.REQ_LANG_ENGLISH: return this.getTranslatedEnglishForecast(forecastText);
            default: this.logger.warn("Unknown lang request")
        }
        return undefined;
    }

    public async getForecast(city: City, reqDay: number, reqLang: number): Promise<Forecast> {
        const forecastText = await this.getForecastTextAt(city, reqDay);
        if (forecastText) {
            return this.getForecastInLanguage(forecastText, reqLang);
        } else {
            return undefined;
        }
    }

}

export { AlojzManager }
