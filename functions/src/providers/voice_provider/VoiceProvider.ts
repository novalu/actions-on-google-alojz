interface VoiceProvider {
    getSpeechUrl(text: string): Promise<string>
}

export { VoiceProvider }
