import { Injectable, OptionalDecorator } from '@angular/core';
import { Subject } from 'rxjs';


// So that TypeScript doesn't complain, we're going to augment the GLOBAL / WINDOW 
// name-space definition to include the Tracker API. This also provides us with a place
// to actually DOCUMENT the API so that our developers aren't guessing about what's
// available on the library.
declare global {
  var Client: Client;
}

export interface Client {

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
}

export interface EventProperties {
  [key: string]: any;
}

export interface Command {
  name: string;
  arg: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerClientService {

  private clientPromise: Promise<Client> | null;

  public onCommand$ = new Subject<Command>();
  
  constructor() {

    let self = this;
    (window as any).RevelDigital = {
      Controller: {
        onCommand: function (name: string, arg: string) {
          self.onCommand$.next({ name: name, arg: arg});
        }
      }
    }

    this.clientPromise = null;
  }

  public callback(...args: any[]): void {

    this.getClient().then((client) => {

      switch (args.length) {
        case 0:
          client.callback();
          break;
        case 1:
          client.callback(args[0]);
          break;
        case 2:
          client.callback(args[1]);
          break;
        case 3:
          client.callback(args[2]);
          break;
        case 4:
          client.callback(args[3]);
          break;
        case 5:
          client.callback(args[4]);
          break;
      }
    })
  }

  public async getDeviceTime(date?: Date): Promise<string> {

    const client = await this.getClient();

    if (date !== undefined) {
      return client.getDeviceTime(date);
    }
    return client.getDeviceTime();
  }

  public async getDeviceTimeZoneName(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneName();
  }

  public async getDeviceTimeZoneID(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneID();
  }

  public async getDeviceTimeZoneOffset(): Promise<number> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneOffset();
  }

  public async getLanguageCode(): Promise<string> {

    const client = await this.getClient();

    return client.getLanguageCode();
  }

  public async getDeviceKey(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceKey();
  }

  public sendCommand(name: string, arg: string): void {

    this.getClient().then((client) => {
      client.sendCommand(name, arg);
    })
  }

  public sendRemoteCommand(deviceKeys: string[], name: string, arg: string): void {
  
    this.getClient().then((client) => {
      client.sendRemoteCommand(deviceKeys, name, arg);
    });
  }

  public track(eventName: string, properties?: EventProperties): void {

    this.getClient().then((client) => {
      client.track(eventName, JSON.stringify(properties));
    })
  }

  public timeEvent(eventName: string): void {

    this.getClient().then((client) => {
      client.timeEvent(eventName);
    })
  }

  public newEventSession(id?: string): void {

    this.getClient().then((client) => {
      if (id !== undefined) {
        client.newEventSession();
      } else {
        client.newEventSession(id);
      }
    })
  }

  public async getRevelRoot(): Promise<string> {

    const client = await this.getClient();

    return client.getRevelRoot();
  }

  // ---
  // PRIVATE METHODS.
  // ---

  // I return a Promise that resolves with a Tracker API (which may be the 3rd-party
  // library or a mock API representation).
  private getClient(): Promise<Client> {

    if (this.clientPromise) {

      return (this.clientPromise);
    }

    if (window.Client) {

      return (this.clientPromise = Promise.resolve(window.Client));
    }

    // A "complete" status indicates that the "load" event has been fired on the
    // window; and, that all sub-resources such as Scripts, Images, and Frames have
    // been loaded.
    if (window.document.readyState === "complete") {

      // If this event has fired AND the 3rd-party script isn't available (see IF-
      // condition BEFORE this one), it means that the 3rd-party script either
      // failed on the network or was BLOCKED by an ad-blocker. As such, we have to
      // fall-back to using a mock API.
      return (this.clientPromise = Promise.resolve(new NoopClient()));
    }

    // ASSERT: If we made it this far, the document has not completed loading (but it
    // may be in an "interactive" state which is when I believe that the Angular app
    // gets bootstrapped). As such, we need bind to the LOAD event to wait for our
    // third-party scripts to load (or fail to load, or be blocked).
    this.clientPromise = new Promise<Client>(
      (resolve) => {

        window.addEventListener(
          "load",
          function handleWindowLoad() {

            // At this point, the 3rd-party library is either available or
            // it's not - there's no further loading to do. If it's not
            // present on the global scope, we're going to fall-back to using
            // a mock API.
            resolve(window.Client || new NoopClient());

          }
        );

      }
    );

    return (this.clientPromise);
  }

}



// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// I provide a mock API for the 3rd-party script. This just allows the consuming code to
// act as though the library is available even if it failed to load (example, it was
// blocked by an ad-blocker).
class NoopClient implements Client {

  constructor() {

    console.warn("Client API not available, falling back to mock API.");
  }

  public callback(...args: any[]): void {

    // NOOP implement, nothing to do....
  }

  public getDeviceTime(date?: Date): Promise<string> {

    return Promise.resolve(null);
  }

  public async getDeviceTimeZoneName(): Promise<string> {

    return Promise.resolve(null);
  }

  public async getDeviceTimeZoneID(): Promise<string> {

    return Promise.resolve(null);
  }

  public async getDeviceTimeZoneOffset(): Promise<number> {

    return Promise.resolve(null);
  }

  public async getLanguageCode(): Promise<string> {

    return Promise.resolve(null);
  }

  public async getDeviceKey(): Promise<string> {

    return Promise.resolve(null);
  }

  public sendCommand(name: string, arg: string): void {

    // NOOP implement, nothing to do....
  }

  public sendRemoteCommand(deviceKeys: string[], name: string, arg: string) {

    // NOOP implement, nothing to do....
  }

  public track(eventName: string, properties?: string): void {

    // NOOP implement, nothing to do....
  }

  public timeEvent(eventName: string): void {

    // NOOP implement, nothing to do....
  }

  public newEventSession(id?: string): void {

    // NOOP implement, nothing to do....
  }

  public async getRevelRoot(): Promise<string> {

    return Promise.resolve(null);
  }
}
