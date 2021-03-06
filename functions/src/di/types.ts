const TYPES = {

    /**********************************************************************************************/
    /* APP                                                                                        */
    /**********************************************************************************************/

    FunctionsApp: Symbol("FunctionsApp"),

    /**********************************************************************************************/
    /* CONFIG                                                                                     */
    /**********************************************************************************************/

    Client: Symbol("Client"),

    /**********************************************************************************************/
    /* MANAGERS                                                                                   */
    /**********************************************************************************************/

    AlojzManager: Symbol("AlojzManager"),

    /**********************************************************************************************/
    /* FULFILLMENTS                                                                               */
    /**********************************************************************************************/

    AlojzFulfillment: Symbol("AlojzFulfillment"),

    /**********************************************************************************************/
    /* PROVIDERS                                                                                  */
    /**********************************************************************************************/

    ForecastProvider: Symbol("ForecastProvider"),
    VoiceProvider: Symbol("VoiceProvider"),
    SecretsProvider: Symbol("SecretsProvider"),

    /**********************************************************************************************/
    /* STORAGES                                                                                   */
    /**********************************************************************************************/

    CitiesStorage: Symbol("CitiesStorage"),

    /**********************************************************************************************/
    /* UTILS                                                                                      */
    /**********************************************************************************************/

    SlackUtils: Symbol("SlackSender"),
    FirebaseUtils: Symbol("FirebaseUtils"),
    Logger: Symbol("Logger"),
    NetworkLogger: Symbol("NetworkLogger"),
    NetworkRequest: Symbol("NetworkRequest")

};

export { TYPES };
