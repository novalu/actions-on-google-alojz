import {SecretsProvider} from "../SecretsProvider";
import {injectable} from "inversify";

@injectable()
class CustomSecretsProvider implements SecretsProvider {

    public getBitlyApiKey(): string {
        return "";
    }

    public getCloudSpeechAppApiKey(): string {
        return "";
    }

    public getCloudSpeechAppUrl(): string {
        return "";
    }

}

export { CustomSecretsProvider }