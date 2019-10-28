import {Container} from "inversify";
import { TYPES } from "./types";
import {Logger} from "../utils/log/Logger";
import {SignaleLogger} from "../utils/log/impl/SignaleLogger";
import {NetworkLogger} from "../utils/network/NetworkLogger";
import {NetworkRequest} from "../utils/network/NetworkRequest";
import {AlojzManager} from "../managers/AlojzManager";
import {CitiesStorage} from "../storages/city/CitiesStorage";
import {CitiesLocalStorage} from "../storages/city/CitiesLocalStorage";
import {AlojzFulfilment} from "../fulfillments/impl/AlojzFulfilment";
import {ConsoleLogger} from "../utils/log/impl/ConsoleLogger";
import {ForecastProvider} from "../providers/forecast_provider/ForecastProvider";
import {HtmlForecastProvider} from "../providers/forecast_provider/impl/HtmlForecastProvider";
import {VoiceProvider} from "../providers/voice_provider/VoiceProvider";
import {SoundOfTextVoiceProvider} from "../providers/voice_provider/impl/SoundOfTextVoiceProvider";
import {TextToSpeechVoiceProvider} from "../providers/voice_provider/impl/TextToSpeechVoiceProvider";
import {ApiForecastProvider} from "../providers/forecast_provider/impl/ApiForecastProvider";
import {SecretsProvider} from "../providers/secrets_provider/SecretsProvider";
import {CustomSecretsProvider} from "../providers/secrets_provider/impl/CustomSecretsProvider";

const baseContainer = new Container();

/**********************************************************************************************/
/* CONFIG                                                                                     */
/**********************************************************************************************/

/**********************************************************************************************/
/* MANAGERS                                                                                   */
/**********************************************************************************************/

baseContainer.bind<AlojzManager>(TYPES.AlojzManager)
    .to(AlojzManager)
    .inSingletonScope();

/**********************************************************************************************/
/* FULFILLMENTS                                                                               */
/**********************************************************************************************/

baseContainer.bind<AlojzFulfilment>(TYPES.AlojzFulfillment)
    .to(AlojzFulfilment)
    .inSingletonScope();

/**********************************************************************************************/
/* STORAGES                                                                                   */
/**********************************************************************************************/

baseContainer.bind<CitiesStorage>(TYPES.CitiesStorage)
    .to(CitiesLocalStorage)
    .inSingletonScope();

/**********************************************************************************************/
/* PROVIDERS                                                                                  */
/**********************************************************************************************/

baseContainer.bind<ForecastProvider>(TYPES.ForecastProvider)
    .to(ApiForecastProvider)
    .inSingletonScope();
baseContainer.bind<VoiceProvider>(TYPES.VoiceProvider)
    .to(TextToSpeechVoiceProvider)
    .inSingletonScope();
baseContainer.bind<SecretsProvider>(TYPES.SecretsProvider)
    .to(CustomSecretsProvider)
    .inSingletonScope();

/**********************************************************************************************/
/* UTILS                                                                                      */
/**********************************************************************************************/

baseContainer.bind<Logger>(TYPES.Logger)
    .to(process.env.NODE_ENV === "development" ? SignaleLogger : ConsoleLogger)
    .inSingletonScope();
baseContainer.bind<NetworkLogger>(TYPES.NetworkLogger)
    .to(NetworkLogger)
    .inSingletonScope();
baseContainer.bind<NetworkRequest>(TYPES.NetworkRequest)
    .to(NetworkRequest)
    .inSingletonScope();

export { baseContainer };
