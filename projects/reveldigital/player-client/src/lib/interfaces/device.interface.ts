import { ILocation } from "./location.interface";

export interface IDevice {

    /**
     * Device name
     * 
     * @type {string}
     */
    name: string;

    /**
     * Device key
     * 
     * @type {string}
     */
    registrationKey: string;

    /**
     * Device type
     * 
     * @type {string}
     */
    deviceType: string;

    /**
     * Entered service date
     * 
     * @type {Date}
     */
    enteredService: Date;

    /**
     * Language code
     * 
     * @type {string}
     */
    langCode?: string;

    /**
     * Time zone
     * 
     * @type {string}
     */
    timeZone?: string;

    /**
     * Device properties
     * 
     * @type {Array<string>}
     */
    tags: Array<string>;

    /**
     * Device location
     * 
     * @type {ILocation}
     */
    location?: ILocation;
}
