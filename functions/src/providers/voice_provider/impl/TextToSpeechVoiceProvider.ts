import {inject, injectable} from "inversify";
import {VoiceProvider} from "../VoiceProvider";
import {TYPES} from "../../../di/types";
import {NetworkRequest} from "../../../utils/network/NetworkRequest";
import {Logger} from "../../../utils/log/Logger";
import * as firebaseAdmin from "firebase-admin";
import uuid from "uuid/v1";
import { BitlyClient } from "bitly";
import {SecretsProvider} from "../../secrets_provider/SecretsProvider";

@injectable()
class TextToSpeechVoiceProvider implements VoiceProvider {

    private firebaseStorage: firebaseAdmin.storage.Storage;
    private bitlyClient: any;

    constructor(
        @inject(TYPES.NetworkRequest) private networkRequest: NetworkRequest,
        @inject(TYPES.SecretsProvider) private secretsProvider: SecretsProvider,
        @inject(TYPES.Logger) private logger: Logger
    ) {
        const config = {
            storageBucket: this.secretsProvider.getCloudSpeechAppUrl(),
            credential: firebaseAdmin.credential.cert(require("../../../../service-account.json")),
        };
        firebaseAdmin.initializeApp(config);
        this.firebaseStorage = firebaseAdmin.storage();
        this.bitlyClient = new BitlyClient(this.secretsProvider.getBitlyApiKey(), {});
    }

    private getSpeechRequestBody(text: string) {
        return {
            audioConfig: {
                audioEncoding: "LINEAR16",
                effectsProfileId: [
                    "medium-bluetooth-speaker-class-device"
                ],
                pitch: 0,
                speakingRate: 0.85
            },
            input: {
                text
            },
            voice: {
                languageCode: "cs-CZ",
                name: "cs-CZ-Wavenet-A"
            }
        };
    }

    private async getSpeechResponseBody(text: string): Promise<any> {
        const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this.secretsProvider.getCloudSpeechAppApiKey()}`;
        const requestBody = this.getSpeechRequestBody(text);
        let data;
        try {
            data = await this.networkRequest.postJson(url, requestBody);
            return data.body;
        } catch (err) {
            this.logger.error("Speech request was not processed", err);
            return undefined;
        }
    }

    private async uploadFile(data): Promise<string> {
        const bucket = this.firebaseStorage.bucket();
        const file = bucket.file(`/${uuid()}.mp3`);
        await file.save(data);
        try {
            const urls = await file.getSignedUrl({
                action: "read",
                expires: "03-09-2491"
            });
            return urls[0];
        } catch (err) {
            this.logger.error("Cannot upload file", err);
            return undefined;
        }
    }

    private async shortenUrl(url: string): Promise<string> {
        const bitlyResult = await this.bitlyClient.shorten(url);
        if (bitlyResult) {
            let shortUrl = (bitlyResult as any).url;
            shortUrl = shortUrl.replace("http", "https");
            return shortUrl;
        } else {
            this.logger.warn("Cannot generate bitly link");
            return undefined;
        }
    }

    public async getSpeechUrl(text: string): Promise<string> {
        const body = await this.getSpeechResponseBody(text);
        if (body && body.audioContent) {
            const buffer = Buffer.from(body.audioContent, "base64");
            const url = await this.uploadFile(buffer);
            return this.shortenUrl(url);
        } else {
            return undefined;
        }
    }

}

export { TextToSpeechVoiceProvider }
