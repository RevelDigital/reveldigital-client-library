/** @ignore */
export interface IClient {

    callback(...args: any[]): void;

    getDeviceTime(date?: Date): Promise<string>;

    getDeviceTimeZoneName(): Promise<string>;

    getDeviceTimeZoneID(): Promise<string>;

    getDeviceTimeZoneOffset(): Promise<number>;

    getLanguageCode(): Promise<string>;

    getDeviceKey(): Promise<string>;

    sendCommand(name: string, arg: string): void;

    sendRemoteCommand(deviceKeys: string[], name: string, arg: string): void;

    track(eventName: string, properties?: string): void;

    timeEvent(eventName: string): void;

    newEventSession(id?: string): void;

    getRevelRoot(): Promise<string>;

    getCommandMap(): Promise<string>;

    getDevice(): Promise<string>;

    finish(): void;
}
