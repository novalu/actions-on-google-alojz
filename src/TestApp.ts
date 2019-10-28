import {inject, injectable} from "inversify";
import { TYPES } from "../functions/src/di/types";
import {Logger} from "../functions/src/utils/log/Logger";
import {CitiesStorage} from "../functions/src/storages/city/CitiesStorage";
import {AlojzManager} from "../functions/src/managers/AlojzManager";
import {VoiceProvider} from "../functions/src/providers/voice_provider/VoiceProvider";

@injectable()
class TestApp {

    constructor(
        @inject(TYPES.CitiesStorage) private citiesStorage: CitiesStorage,
        @inject(TYPES.AlojzManager) private alojzManager: AlojzManager,
        @inject(TYPES.VoiceProvider) private voiceProvider: VoiceProvider,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    public async start() {
        const cities = this.citiesStorage.getCities();
        // for (const city of cities) {
        //     this.logger.debug(city.getUrlName());
        // }

        // this.logger.debug(await this.alojzManager.getTodayForecastInCzech(cities[0]));
        // this.logger.debug(await this.alojzManager.getTodayForecastInEnglish(cities[0]));
        // this.logger.debug(await this.alojzManager.getTomorrowForecastInCzech(cities[0]));
        // this.logger.debug(await this.alojzManager.getTomorrowForecastInEnglish(cities[0]));

        // for (let i = 0; i < 1; i++) {
        //     this.logger.debug(await this.alojzManager.getTodayForecastInCzech(cities[i]));
        // }

        this.logger.debug(await this.alojzManager.getForecast(cities[0], AlojzManager.REQ_DAY_TODAY, AlojzManager.REQ_LANG_CZECH));
        this.logger.debug(await this.alojzManager.getForecast(cities[0], AlojzManager.REQ_DAY_TODAY, AlojzManager.REQ_LANG_ENGLISH));
        this.logger.debug(await this.alojzManager.getForecast(cities[0], AlojzManager.REQ_DAY_TOMORROW, AlojzManager.REQ_LANG_CZECH));
        this.logger.debug(await this.alojzManager.getForecast(cities[0], AlojzManager.REQ_DAY_TOMORROW, AlojzManager.REQ_LANG_ENGLISH));

        //await this.voiceProvider.getSpeechUrl("Ahoj, jak se máš?");

        process.exit(0);
    }

}

export { TestApp }