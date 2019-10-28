interface SecretsProvider {

    getCloudSpeechAppUrl(): string;
    getCloudSpeechAppApiKey(): string;

    getBitlyApiKey(): string;

}

export { SecretsProvider }