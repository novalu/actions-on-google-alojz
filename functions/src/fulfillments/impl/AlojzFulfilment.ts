import {inject, injectable} from "inversify";
import {TYPES} from "../../di/types";
import {Logger} from "../../utils/log/Logger";
import {Fulfillment} from "../Fulfillment";
import {AlojzManager} from "../../managers/AlojzManager";
import moment from "moment";
import {CitiesStorage} from "../../storages/city/CitiesStorage";
import {Suggestions, Permission} from "actions-on-google";
import * as geolib from "geolib";
import {City} from "../../model/City";
import {LatLng} from "../../model/LatLng";
import {MeasuredCity} from "../../model/MeasuredCity";
import * as lodash from "lodash";
import {Forecast} from "../../model/Forecast";
import {SpeechForecast} from "../../model/SpeechForecast";
import {TimeUtils} from "../../utils/TimeUtils";

@injectable()
class AlojzFulfilment implements Fulfillment {

    private readonly SSML_BEGIN = "<speak>";
    private readonly SSML_END = "</speak>";
    private readonly SSML_BREAK = "<break time='300ms' />";

    private readonly TEXT_FORECAST_QUESTION = "Do you want to hear a forecast?";
    private readonly TEXT_ANOTHER_FORECAST_QUESTION = "Do you want to hear another forecast?";
    private readonly TEXT_CITY_NOT_SAVED = "No problem, I will not use this city next time.";
    private readonly TEXT_CANT_GET_REQUESTED_CITY_FORECAST = `${this.SSML_BEGIN}I can't get the forecast for this city. ${this.SSML_BREAK}Get forecast for another city or try again later.${this.SSML_END}`;
    private readonly TEXT_CANT_GET_SAVED_CITY_FORECAST = `${this.SSML_BEGIN}I can't get the forecast for your saved city. ${this.SSML_BREAK}Get forecast for another city or try again later.${this.SSML_END}`;
    private readonly TEXT_LOCATION_PERMISSION_CONTEXT = "To know your location for purpose of weather forecast";
    private readonly TEXT_UNAVAILABLE_DAY_FORECAST = `${this.SSML_BEGIN}I support only today and tomorrow forecast if available. ${this.SSML_BREAK}What forecast do you want to hear?${this.SSML_END}`;
    private readonly TEXT_FORECAST_FOR_CITY_IS_NOT_AVAILABLE = `${this.SSML_BEGIN}It looks like forecast for your city is not available right now. ${this.SSML_BREAK}Get forecast for another city or try again later.${this.SSML_END}`;
    private readonly TEXT_DONT_WANT_TODAY_FORECAST = "No problem, have a nice day!";
    private readonly TEXT_DONT_WANT_NEAREST_CITY = `${this.SSML_BEGIN}Ok, I will not use the nearest city. ${this.SSML_BREAK}If you want to hear forecast, tell me another one.${this.SSML_END}`;
    private readonly TEXT_PERMISSION_NOT_GRANTED = `${this.SSML_BEGIN}You have not granted permission. ${this.SSML_BREAK}If you still want to hear forecast for your city, tell me the city.${this.SSML_END}`;
    private readonly TEXT_FAR_AWAY_FROM_ANY_CITY = `${this.SSML_BEGIN}You're far away from any city for which I have forecast. ${this.SSML_BREAK}If you want to hear forecast, tell me the city.${this.SSML_END}`;
    private readonly TEXT_SHOULD_I_GET_FORECAST_FOR_THAT_CITY = "Should I get forecast for that city?";
    private readonly TEXT_NEXT_TIME_WITHOUT_CITY_STATEMENT = "Next time you can ask me without telling me this city.";
    private readonly TEXT_JUST_TELL_ME_THE_CITY = "Ok, just tell me the city.";
    private readonly TEXT_NO_PROBLEM_HAVE_A_NICE_DAY = "No problem, have a nice day!";
    private readonly TEXT_ONLY_FORECAST_IN_CZECH = "Keep in mind, in czech is only the forecast, not interface, so you still have to ask me in english.";

    private readonly TEXT_REMEMBERED_CITY = (cityName: string) => `I've just remembered city ${cityName}`;
    private readonly TEXT_NEAREST_CITY_IS = (city: City) => `Nearest city is ${city.name}`;
    private readonly TEXT_REMEMBER_CITY_QUESTION = (city: City) => `Could I remember city ${city.name} to get forecast for you without telling me the city next time?`;
    private readonly TEXT_FORECAST_FOR_CITY = (city: City, forecast: string) => `${this.SSML_BEGIN}In ${city.name} ${forecast}${this.SSML_END}`;
    private readonly TEXT_NEAREST_CITY_ASK_FOR_SAVE = (city: City) => `${this.SSML_BEGIN}${this.TEXT_NEAREST_CITY_IS(city)}. ${this.SSML_BREAK}${this.TEXT_SHOULD_I_GET_FORECAST_FOR_THAT_CITY}${this.SSML_END}`;
    private readonly TEXT_REMEMBERED_NEXT_TIME = (cityName: string) => `${this.SSML_BEGIN}${this.TEXT_REMEMBERED_CITY(cityName)}. ${this.SSML_BREAK}${this.TEXT_NEXT_TIME_WITHOUT_CITY_STATEMENT}${this.SSML_END}`;
    private readonly TEXT_USE_THIS_LANG = (lang: string) => `Ok, I'll be using ${lang} language for telling you the forecast next time.`;
    private readonly TEXT_CHANGED_TO_CZECH = () => `${this.SSML_BEGIN}${this.TEXT_USE_THIS_LANG("czech")} ${this.SSML_BREAK}${this.TEXT_ONLY_FORECAST_IN_CZECH}${this.SSML_END}`;
    private readonly TEXT_CHANGED_TO_ENGLISH = () => `${this.SSML_BEGIN}${this.TEXT_USE_THIS_LANG("english")}${this.SSML_END}`;

    private readonly INTENT_CHANGE_LANGUAGE = "change_language";
    private readonly INTENT_YES = "yes";
    private readonly INTENT_NO = "no";
    private readonly INTENT_DEBUG_RESET_STORAGE = "debug_reset_storage";
    private readonly INTENT_SAVE_CITY_YES = "save_city_yes";
    private readonly INTENT_SAVE_CITY_NO = "save_city_no";
    private readonly INTENT_TODAY_FORECAST = "today_forecast";
    private readonly INTENT_TOMORROW_FORECAST = "tomorrow_forecast";
    private readonly INTENT_GET_FORECAST = "get_forecast";
    private readonly INTENT_NEAREST_CITY_YES = "nearest_city_yes";
    private readonly INTENT_NEAREST_CITY_NO = "nearest_city_no";
    private readonly INTENT_NEAREST_CITY = "nearest_city";
    private readonly INTENT_GET_PLACE_PERMISSION = "get_place_permission";

    private readonly CONTEXT_SAVE_CITY = "save-city";
    private readonly CONTEXT_DAY_FORECAST = "day-forecast";
    private readonly CONTEXT_NEAREST_CITY = "nearest-city";

    private readonly TEXT_YES = "Yes";
    private readonly TEXT_NO = "No";

    private readonly TEXT_TODAY = "Today";
    private readonly TEXT_TOMORROW = "Tomorrow";

    private dialogflowApp: any;

    constructor(
        @inject(TYPES.AlojzManager) private alojzManager: AlojzManager,
        @inject(TYPES.CitiesStorage) private citiesStorage: CitiesStorage,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    public initialize(dialogflowApp: any) {
        this.dialogflowApp = dialogflowApp;
        this.buildGetForecastFulfilment();
        this.buildGetPlacePermissionFulfillment();
        this.buildSaveCityYesFulfillment();
        this.buildSaveCityNoFulfillment();
        this.buildNearestCityFulfillment();
        this.buildNearestCityYesFulfillment();
        this.buildNearestCityNoFulfillment();
        this.buildTodayForecastFulfillment();
        this.buildTomorrowForecastFulfillment();
        this.buildYesFulfillment();
        this.buildNoFulfillment();

        this.buildResetStorageFulfillment();
        this.buildChangeLanguageFulfillment();
    }

    private buildChangeLanguageFulfillment() {
        this.dialogflowApp.intent(this.INTENT_CHANGE_LANGUAGE, async (conv, { lang }) => {
            conv.user.storage.lang = lang;
            if (lang === "czech") {
                conv.ask(this.TEXT_CHANGED_TO_CZECH())
            } else {
                conv.ask(this.TEXT_CHANGED_TO_ENGLISH())
            }
            conv.ask(this.TEXT_FORECAST_QUESTION);
        });
    }

    private buildResetStorageFulfillment() {
        this.dialogflowApp.intent(this.INTENT_DEBUG_RESET_STORAGE, async (conv) => {
            conv.user.storage.cityName = undefined;
            conv.ask("Storage resetted.");
            conv.ask(this.TEXT_FORECAST_QUESTION);
        });
    }

    private buildYesFulfillment() {
        this.dialogflowApp.intent(this.INTENT_YES, async (conv) => {
            conv.ask(this.TEXT_JUST_TELL_ME_THE_CITY);
        });
    }

    private buildNoFulfillment() {
        this.dialogflowApp.intent(this.INTENT_NO, async (conv) => {
            conv.close(this.TEXT_NO_PROBLEM_HAVE_A_NICE_DAY);
        });
    }

    private buildSaveCityYesFulfillment() {
        this.dialogflowApp.intent(this.INTENT_SAVE_CITY_YES, async (conv) => {
            const cityName = conv.contexts.get(this.CONTEXT_SAVE_CITY).parameters.cityName;
            conv.contexts.delete(this.CONTEXT_SAVE_CITY);
            conv.user.storage.cityName = cityName;
            conv.ask(this.TEXT_REMEMBERED_NEXT_TIME(cityName));
            conv.ask(this.TEXT_ANOTHER_FORECAST_QUESTION);
        });
    }

    private buildSaveCityNoFulfillment() {
        this.dialogflowApp.intent(this.INTENT_SAVE_CITY_NO, async (conv) => {
            conv.contexts.delete(this.CONTEXT_SAVE_CITY);
            conv.ask(this.TEXT_CITY_NOT_SAVED);
            conv.ask(this.TEXT_ANOTHER_FORECAST_QUESTION);
        });
    }

    private askForRememberCity(conv, city: City) {
        if (conv.user.storage.cityName !== city.name) {
            conv.contexts.set(this.CONTEXT_SAVE_CITY, 3, {cityName: city.name});
            conv.ask(this.TEXT_REMEMBER_CITY_QUESTION(city));
            conv.ask(new Suggestions(this.TEXT_YES, this.TEXT_NO));
        } else {
            conv.ask(this.TEXT_ANOTHER_FORECAST_QUESTION);
        }
    }

    private async tellForecast(conv, params, day: number) {
        const requestedCity = params.city;
        let city: City;
        if (requestedCity) {
            city = this.citiesStorage.getCityForName(requestedCity);
            if (city) {
                await this.tellForecastByCity(conv, city, day);
                this.askForRememberCity(conv, city);
            } else {
                this.logger.error(`Can't find city for name: ${requestedCity}`);
                conv.ask(this.TEXT_CANT_GET_REQUESTED_CITY_FORECAST)
            }
        } else if (conv.user.storage.cityName) {
            city = this.citiesStorage.getCityForName(conv.user.storage.cityName);
            if (city) {
                await this.tellForecastByCity(conv, city, day);
                conv.ask(this.TEXT_ANOTHER_FORECAST_QUESTION);
            } else {
                this.logger.error(`Can't find city for name: ${requestedCity}`);
                conv.ask(this.TEXT_CANT_GET_SAVED_CITY_FORECAST);
            }
        } else if (lodash.find(conv.user.permissions, "DEVICE_PRECISE_LOCATION")) {
            await this.tellForecastByLocation(conv, day);
        } else {
            conv.user.storage.day = day;
            const options = {
                context: this.TEXT_LOCATION_PERMISSION_CONTEXT,
                permissions: ["DEVICE_PRECISE_LOCATION"],
            };
            conv.ask(new Permission(options as any));
        }
    }

    private buildTodayForecastFulfillment() {
        this.dialogflowApp.intent(this.INTENT_TODAY_FORECAST, async (conv) => {
            const cityName = conv.contexts.get(this.CONTEXT_DAY_FORECAST).parameters.cityName;
            conv.contexts.delete(this.CONTEXT_DAY_FORECAST);
            await this.tellForecast(conv, { city: cityName }, AlojzManager.REQ_DAY_TODAY)
        });
    }

    private buildTomorrowForecastFulfillment() {
        this.dialogflowApp.intent(this.INTENT_TOMORROW_FORECAST, async (conv) => {
            const cityName = conv.contexts.get(this.CONTEXT_DAY_FORECAST).parameters.cityName;
            conv.contexts.delete(this.CONTEXT_DAY_FORECAST);
            await this.tellForecast(conv, { city: cityName }, AlojzManager.REQ_DAY_TOMORROW)
        });
    }

    private buildGetForecastFulfilment() {
        this.dialogflowApp.intent(this.INTENT_GET_FORECAST, async (conv, params) => {
            const todayDate = TimeUtils.momentTz();
            const tomorrowDate = TimeUtils.momentTz(todayDate).add(1, "d");
            if (params.date) {
                const requestedDate = TimeUtils.momentTz(params.date);
                if (requestedDate.isSame(todayDate, "d")) {
                    await this.tellForecast(conv, params, AlojzManager.REQ_DAY_TODAY);
                    return;
                } else if (requestedDate.isSame(tomorrowDate, "d")) {
                    await this.tellForecast(conv, params, AlojzManager.REQ_DAY_TOMORROW);
                    return;
                } else {
                    conv.contexts.set(this.CONTEXT_DAY_FORECAST, 3, { cityName: params.city });
                    conv.ask(this.TEXT_UNAVAILABLE_DAY_FORECAST);
                    conv.ask(new Suggestions(this.TEXT_TODAY, this.TEXT_TOMORROW));
                }
            } else {
                await this.tellForecast(conv, params, AlojzManager.REQ_DAY_ANY);
                return;
            }
        });
    }

    private addSpeechBreaksToForecast(forecast: Forecast) {
        forecast.text = forecast.text.replace(/\./g, `.${this.SSML_BREAK}`);
    }

    private async tellEnglishForecastByCity(conv, city: City, day: number) {
        try {
            const forecast = await this.alojzManager.getForecast(city, day, AlojzManager.REQ_LANG_ENGLISH);
            if (forecast) {
                this.addSpeechBreaksToForecast(forecast);
                conv.ask(this.TEXT_FORECAST_FOR_CITY(city, forecast.text));
            } else {
                this.logger.error("Can't get forecast for " + city.name);
                conv.ask(this.TEXT_FORECAST_FOR_CITY_IS_NOT_AVAILABLE);
            }
        } catch (err) {
            this.logger.error("Can't get forecast for " + city.name + ", err: " + err);
            conv.ask(this.TEXT_FORECAST_FOR_CITY_IS_NOT_AVAILABLE);
        }
    }

    private async tellCzechForecastByCity(conv, city: City, day: number) {
        try {
            const forecast = await this.alojzManager.getForecast(city, day, AlojzManager.REQ_LANG_CZECH);
            if (forecast && forecast instanceof SpeechForecast) {
                conv.ask(`${this.SSML_BEGIN}<audio src="${forecast.url}"><desc>${forecast.text}</desc>Can't get forecast</audio>${this.SSML_END}`);
            } else {
                this.logger.error("Can't get spoken czech forecast for " + city.name);
                conv.ask(this.TEXT_FORECAST_FOR_CITY_IS_NOT_AVAILABLE);
            }
        } catch (err) {
            this.logger.error("Can't get spoken czech forecast for " + city.name + ", err: " + err);
            conv.ask(this.TEXT_FORECAST_FOR_CITY_IS_NOT_AVAILABLE);
        }
    }

    private async tellForecastByCity(conv, city: City, day: number) {
        if (conv.user.storage.lang === "czech") {
            await this.tellCzechForecastByCity(conv, city, day);
        } else {
            await this.tellEnglishForecastByCity(conv, city, day);
        }
    }

    private getMeasuredCities(cities: City[], location: LatLng): MeasuredCity[] {
        return lodash.map(cities, (city: City) => {
            const distance = geolib.getDistance(
                { latitude: location.lat, longitude: location.lng },
                { latitude: city.location.lat, longitude: city.location.lng },
                1000
            );
            return new MeasuredCity(city.name, city.location, distance)
        });
    }

    private buildNearestCityYesFulfillment() {
        this.dialogflowApp.intent(this.INTENT_NEAREST_CITY_YES, async (conv) => {
            const cityName = conv.contexts.get(this.CONTEXT_NEAREST_CITY).parameters.cityName;
            const day = conv.contexts.get(this.CONTEXT_NEAREST_CITY).parameters.day;
            conv.contexts.delete(this.CONTEXT_NEAREST_CITY);
            const city = this.citiesStorage.getCityForName(cityName);
            await this.tellForecastByCity(conv, city, day);
            this.askForRememberCity(conv, city);
        });
    }

    private buildNearestCityNoFulfillment() {
        this.dialogflowApp.intent(this.INTENT_NEAREST_CITY_NO, async (conv) => {
            conv.contexts.delete(this.CONTEXT_NEAREST_CITY);
            conv.ask(this.TEXT_DONT_WANT_NEAREST_CITY);
        });
    }

    private buildNearestCityFulfillment() {
        this.dialogflowApp.intent(this.INTENT_NEAREST_CITY, async (conv, params) => {
            const cityName = params.city;
            const day = conv.contexts.get(this.CONTEXT_NEAREST_CITY).parameters.day;
            conv.contexts.delete(this.CONTEXT_NEAREST_CITY);
            const city = this.citiesStorage.getCityForName(cityName);
            await this.tellForecastByCity(conv, city, day);
            this.askForRememberCity(conv, cityName);
        })
    }

    private async tellForecastByLocation(conv, day: number) {
        const { latitude, longitude } = conv.device.location.coordinates;
        const currentLocation = new LatLng(latitude, longitude);
        let cities = this.citiesStorage.getCities(); // all cities
        cities = this.getMeasuredCities(cities, currentLocation); // cities with computed location
        cities = lodash.sortBy(cities, (city: MeasuredCity) => city.distanceInMeters); // sorted by location
        cities = lodash.filter(cities, (city: MeasuredCity) => city.distanceInMeters < 50000); // filtered only close cities
        if (cities.length > 0) {
            const nearestCity = cities[0];
            conv.contexts.set(this.CONTEXT_NEAREST_CITY, 3, { cityName: nearestCity.name, day });
            conv.ask(this.TEXT_NEAREST_CITY_ASK_FOR_SAVE(nearestCity));
            const suggestions = [this.TEXT_YES, this.TEXT_NO];
            const remainingCities = lodash.tail(cities);
            const firstSixRemainingCities = lodash.take(remainingCities, 6);
            const firstSixRemainingCityNames = lodash.map(firstSixRemainingCities, (city: MeasuredCity) => city.name);
            suggestions.push(...firstSixRemainingCityNames);
            conv.ask(new Suggestions(suggestions))
        } else {
            conv.ask(this.TEXT_FAR_AWAY_FROM_ANY_CITY);
        }
    }

    private buildGetPlacePermissionFulfillment() {
        this.dialogflowApp.intent(this.INTENT_GET_PLACE_PERMISSION, async (conv, params, confirmationGranted) => {
            if (confirmationGranted) {
                const day = conv.user.storage.day;
                conv.user.storage.day = undefined;
                await this.tellForecastByLocation(conv, day);
            } else {
                conv.ask(this.TEXT_PERMISSION_NOT_GRANTED);
            }
        });
    }

}

export { AlojzFulfilment }
