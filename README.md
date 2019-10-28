# Alojz (Weather in Czech Republic)

Source code for the Actions on Google app Weather in Czech Republic ([App Directory](https://assistant.google.com/services/a/uid/000000e97c3f16a5?hl=en)). This action is an experimental app for getting forecast in a language which Google Assistant doesn't support, in this case Czech language. Action is getting forecast from the NLP app [Alojz.cz](http://www.alojz.cz), which process yr.no forecast into natural language.

## Build

If you want to modify and build changes, then you must recompile from TypeScript sources with command:

```
$ gulp build
```

Keep in mind, if you want to use `TextToSpeechVoiceProvider`, you need to fill Google Cloud app project and corresponding API key and Bit.ly API key into `CustomSecretsProvider`. Google Cloud app project needs to have enabled Cloud Text-to-Speech API.

Pull requests are welcome!

## Author

### Lukas Novak

[![Author](http://www.novaklukas.cz/images/profile.png)](http://www.novaklukas.cz)

Freelance full-stack software developer based in Olomouc, Czech Republic. I focus on mobile apps with Kotlin and application servers in Node.js. As a hobby, I experiment with voice assistants and build my smart home. See my [personal web page](http://www.novaklukas.cz) (in Czech) or blog on [Medium](https://medium.com/@novalu)