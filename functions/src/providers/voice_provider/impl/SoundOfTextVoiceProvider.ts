import {VoiceProvider} from "../VoiceProvider";
import * as soundoftext from "soundoftext-js";
import {injectable} from "inversify";

@injectable()
class SoundOfTextVoiceProvider implements VoiceProvider {

    public async getSpeechUrl(text: string): Promise<string> {
        const speechRequestData = {
            text,
            voice: "cs-CZ"
        };
        return soundoftext.sounds.create(speechRequestData);
    }

}

export { SoundOfTextVoiceProvider }
