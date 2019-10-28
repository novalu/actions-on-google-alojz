import {Forecast} from "./Forecast";

class SpeechForecast extends Forecast {
    constructor(
        text: string,
        lang: number,
        public url: string
    ) {
        super(text, lang)
    }
}

export { SpeechForecast }
