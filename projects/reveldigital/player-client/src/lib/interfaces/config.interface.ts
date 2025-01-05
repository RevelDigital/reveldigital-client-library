export interface IConfig {

    /**
     * Preferences
     * 
     * @type {any}
     * 
     * @memberof IConfig
     */
    prefs: IDictionary<any>;

    /**
     * Config type
     * 
     * @type {ConfigType}
     * 
     * @memberof IConfig
     */
    type: ConfigType;

    /**
     * Is this event triggered by the opener
     * 
     * @type {boolean}
     * 
     * @memberof IConfig
     */
    isOpener: boolean;
}

export interface IDictionary<T> {
    [Key: string]: T;
}

export enum ConfigType {
    OpenConfig = 'openConfig',
    ApplyConfig = 'applyConfig'
}
