import * as lodash from "lodash";

class Forecast {
    public static readonly LANG_CZECH = 0;
    public static readonly LANG_ENGLISH = 1;

    constructor(
        public text: string,
        public lang: number
    ) {
        this.prettier()
    }

    public prettier() {
        switch (this.lang) {
            case Forecast.LANG_CZECH: this.prettierCzechText(); break;
            case Forecast.LANG_ENGLISH: this.prettierEnglishText(); break;
        }
    }

    private prettierCzechText() {
        this.text = this.text.replace(/do (\d{1,2})/g, "do $1 hodin");
        this.text = this.text.replace(/°C/g, " stupňů");
        this.text = this.text.replace(/(\d+)-(\d+)/g, "$1 až $2");
        // return edited.replace(/ do ([^ ]*)(?! hodin)/g, " do $1 hodiny");
    }

    private prettierEnglishText() {
        this.text = this.text.replace(/ ?° C/g, " °C");
        this.text = lodash.lowerFirst(this.text);
    }
}

export { Forecast }
