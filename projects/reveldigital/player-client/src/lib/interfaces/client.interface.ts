import { IDictionary } from "./config.interface";

/** @ignore */
export interface IClient {

    /**
     * Callback to the player.
     * This is the primary method of communication between the client and the player.
     * 
     * @param {...any[]} args
     * @returns {void}
     * @memberof IClient
     */
    callback(...args: any[]): void;

    /**
     * Get device name
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getDeviceTime(date?: Date): Promise<string | null>;

    /**
     * Get device time zone name
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getDeviceTimeZoneName(): Promise<string | null>;

    /**
     * Get device time zone ID
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getDeviceTimeZoneID(): Promise<string | null>;

    /**
     * Get device time zone offset
     * 
     * @returns {Promise<number | null>}
     * @memberof IClient
     */
    getDeviceTimeZoneOffset(): Promise<number | null>;

    /**
     * Get device language code
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getLanguageCode(): Promise<string | null>;

    /**
     * Get device key
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getDeviceKey(): Promise<string | null>;

    /**
     * Send command to device
     * 
     * @param name 
     * @param arg 
     * @returns {void}
     * @memberof IClient
     */
    sendCommand(name: string, arg: string): void;

    /**
     * Send remote command to device
     * 
     * @param deviceKeys
     * @param name
     * @param arg
     * @returns {void}
     * @memberof IClient
     */
    sendRemoteCommand(deviceKeys: string[], name: string, arg: string): void;

    /**
     * Track event
     * 
     * In the case of a timed event, the duration is calculated from the timeEvent call to the track call.
     * 
     * @param eventName 
     * @param properties 
     * @returns {void}
     * @memberof IClient
     */
    track(eventName: string, properties?: string): void;

    /**
     * Start tracking of event with duration
     * 
     * @param eventName
     * @returns {void}
     * @memberof IClient
     */
    timeEvent(eventName: string): void;

    /**
     * Start a new session
     * 
     * @param id optional session ID
     * @returns {void}
     * @memberof IClient
     */
    newEventSession(id?: string): void;

    /**
     * Get the root directory of the Revel system
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getRevelRoot(): Promise<string | null>;

    /**
     * Get the command map
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getCommandMap(): Promise<string | null>;

    /**
     * Signals to the player that the client is finished and the player can transition to the next source
     */
    finish(): void;

    /**
     * Get device information
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getDevice(): Promise<string | null>;

    /**
     * Get width of the visualization area
     * 
     * @returns {Promise<number | null>}
     * @memberof IClient
     */
    getWidth(): Promise<number | null>;

    /**
     * Get height of the visualization area
     * 
     * @returns {Promise<number | null>}
     * @memberof IClient
     */
    getHeight(): Promise<number | null>;

    /**
     * Get the duration of the currently playing source
     * (only applicable when associated with a playlist)
     * 
     * @returns {Promise<number | null>}
     * @memberof IClient
     */
    getDuration(): Promise<number | null>;

    /**
     * Get the SDK version
     * 
     * @returns {Promise<string | null>}
     * @memberof IClient
     */
    getSdkVersion(): Promise<string | null>;

    /**
     * Sends the preference values to the CMS for assignement to the gadget configuration.
     * 
     * Provides the ability to have the gadget present a UI for setting preferences.
     * Only available during design time.
     * 
     * @param prefs key/value pairs of preferences to apply 
     */
    applyConfig(prefs: IDictionary<any>): void;
}
