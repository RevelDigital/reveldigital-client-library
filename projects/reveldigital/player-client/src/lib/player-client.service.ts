import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { gadgets } from '@reveldigital/gadget-types';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { filter, map, share, tap } from 'rxjs/operators';
import { IClient } from './interfaces/client.interface';
import { ICommand } from './interfaces/command.interface';
import { IDictionary } from './interfaces/config.interface';
import { IDevice } from './interfaces/device.interface';
import { IEventProperties } from './interfaces/event-properties.interface';
import { version } from './version';

//import { version } from './version.js';

// So that TypeScript doesn't complain, we're going to augment the GLOBAL / WINDOW 
// name-space definition to include the Tracker API. This also provides us with a place
// to actually DOCUMENT the API so that our developers aren't guessing about what's
// available on the library.

/** @ignore */
declare global {
  var Client: IClient;
}

/**
 * Service for interacting with the Revel Digital player client.
 * 
 * This service provides a comprehensive interface for gadgets and web applications
 * to communicate with the Revel Digital player environment. It handles device
 * information, commands, events, analytics tracking, and configuration management.
 * 
 * The service supports both direct API calls and event-based communication patterns,
 * allowing gadgets to respond to player lifecycle events (start, stop, commands) and
 * send data back to the player or remote devices.
 * 
 * ```typescript
 * constructor(private client: PlayerClientService) {
 *   // Subscribe to player events
 *   this.client.onStart$.subscribe(() => {
 *     console.log('Gadget started');
 *   });
 *   
 *   this.client.onCommand$.subscribe(command => {
 *     console.log('Received command:', command);
 *   });
 * }
 * 
 * async ngOnInit() {
 *   // Get device information
 *   const device = await this.client.getDevice();
 *   const deviceTime = await this.client.getDeviceTime();
 *   
 *   // Track analytics
 *   this.client.track('gadget_loaded', { version: '1.0' });
 * }
 * ```
 * 
 * @since 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerClientService implements OnDestroy {

  /** @ignore */
  private clientPromise: Promise<IClient> | null;

  /**
   * Observable stream of commands sent to this player from the Revel Digital platform.
   * Subscribe to this to handle custom commands sent from templates, playlists, or remote devices.
   * 
   * ```typescript
   * this.client.onCommand$.subscribe(command => {
   *   if (command.name === 'customAction') {
   *     this.handleCustomAction(command.arg);
   *   }
   * });
   * ```
   */
  public onCommand$ = new Subject<ICommand>();

  /**
   * Observable that signals when the gadget has been loaded and is ready to start.
   * Emits `true` when ready, `false` when destroyed.
   * 
   * ```typescript
   * this.client.onReady$.subscribe(isReady => {
   *   if (isReady) {
   *     console.log('Client is ready');
   *     this.initializeGadget();
   *   }
   * });
   * ```
   */
  public onReady$ = new BehaviorSubject(false);

  /**
   * Observable that signals when the gadget has been started by the player.
   * This event occurs when the player begins execution of the gadget content.
   * 
   * ```typescript
   * this.client.onStart$.subscribe(() => {
   *   console.log('Gadget started');
   *   this.startAnimation();
   * });
   * ```
   */
  public onStart$ = new Subject();

  /**
   * Observable that signals when the gadget has been stopped by the player.
   * This event occurs when the player stops execution, typically when moving
   * to the next item in a playlist or when the content duration expires.
   * 
   * ```typescript
   * this.client.onStop$.subscribe(() => {
   *   console.log('Gadget stopped');
   *   this.cleanup();
   * });
   * ```
   */
  public onStop$ = new Subject();

  /**
   * Observable that signals when the gadget should open the configuration window.
   * This allows gadgets to respond to configuration requests from the player.
   * 
   * ```typescript
   * this.client.onConfig$.subscribe(() => {
   *   this.openConfigurationDialog();
   * });
   * ```
   */
  public onConfig$ = new Subject();

  /**
   * Observable that signals when the gadget has received a postMessage event from the player.
   * This handles communication between the gadget and player via the postMessage API.
   * 
   * ```typescript
   * this.client.onPostMessage$.subscribe(message => {
   *   console.log('Received message:', message);
   *   this.handlePlayerMessage(message);
   * });
   * ```
   */
  public onPostMessage$ = new Subject();

  //
  // Two methods available for calling into the library:
  //
  // 1) Using dispatchEvent() with the following custom events
  // 2) Using the window scoped RevelDigital object as defined in the constructor
  //
  /** @ignore */
  private onStartSub: Subscription;
  /** @ignore */
  private onStartEvt$ = fromEvent(window, 'RevelDigital.Start').pipe(
    share(),
    tap(this.onStart$)
  );
  /** @ignore */
  private onStopSub: Subscription;
  /** @ignore */
  private onStopEvt$ = fromEvent(window, 'RevelDigital.Stop').pipe(
    share(),
    tap(this.onStop$)
  );
  /** @ignore */
  private onCommandSub: Subscription;
  /** @ignore */
  private onCommandEvt$ = fromEvent<ICommand>(window, 'RevelDigital.Command').pipe(
    map((e: any) => { return { name: e.detail.name, arg: e.detail.arg } as ICommand }),
    share(),
    tap(this.onCommand$)
  );
  /** @ignore */
  // private onConfigSub: Subscription;
  // /** @ignore */
  // private onConfigEvt$ = fromEvent(window, 'RevelDigital.Config').pipe(
  //   share(),
  //   tap((e: CustomEvent) => {
  //     console.log(e);

  //     if (e.detail.type === 'applyConfig' && e.detail.isOpener) {
  //       this.applyConfig(e.detail.config); // propagate config to iframe parent from the popup window
  //     } else {
  //       this.onConfig$.next(e.detail);
  //     }
  //   })
  // );
  // private onPostMessageSub: Subscription;
  // private onPostMessageEvt$ = fromEvent(window, 'message').pipe(
  //   filter((messageEvent: MessageEvent) =>
  //     messageEvent.source !== window.parent &&
  //     typeof messageEvent.data === 'string' &&
  //     messageEvent.data.startsWith('reveldigital:')),
  //   map((e: any) => { return JSON.parse(e.substring(13)) as Command }),
  //   share(),
  //   tap(this.onCommand$)
  // );

  private onPostMessageSub: Subscription;
  private onPostMessageEvt$ = fromEvent(window, 'message').pipe(
    filter((messageEvent: MessageEvent) =>
      //messageEvent.source !== window.parent &&
      typeof messageEvent.data === 'string'),
    map((e: any) => JSON.parse(e.data)),
    share(),
    tap((e: any) => {
      if (e.type === 'applyConfig' && e.isOpener) {
        e.isOpener = false;
        // propagate config to iframe parent from the popup window
        window.parent.postMessage(
          JSON.stringify(e),
          '*'
        );
      } else if (e.type === 'openConfig') {
        this.onConfig$.next(null);
      }
    }),
    tap(e => this.onPostMessage$.next(e))
  );


  /** @ignore */
  constructor(zone: NgZone) {

    let self = this;
    (window as any).RevelDigital = {
      Controller: {
        onCommand: function (name: string, arg: string) {
          zone.run(() => {
            self.onCommand$.next({ name: name, arg: arg });
          });
        },
        onStart: function () {
          zone.run(() => {
            self.onStart$.next(null);
          });
        },
        onStop: function () {
          zone.run(() => {
            self.onStop$.next(null);
          });
        }
      }
    }

    this.onStartSub = this.onStartEvt$.subscribe(() => { });
    this.onStopSub = this.onStopEvt$.subscribe(() => { });
    this.onCommandSub = this.onCommandEvt$.subscribe(() => { });
    //this.onConfigSub = this.onConfigEvt$.subscribe(() => { });
    this.onPostMessageSub = this.onPostMessageEvt$.subscribe(() => { });

    this.clientPromise = null;

    this.onReady$.next(true);
  }

  /** @ignore */
  ngOnDestroy(): void {

    this.onStartSub?.unsubscribe();
    this.onStopSub?.unsubscribe();
    this.onCommandSub?.unsubscribe();
    //this.onConfigSub?.unsubscribe();
    this.onPostMessageSub?.unsubscribe();

    this.onReady$.next(false);
  }

  /** @ignore */
  public static init(data: any) {

    console.log(
      '%c⚙️ Initializing Revel Digital client library',
      'background-color:blue; color:yellow;'
    );
  }

  /**
   * Sends a callback to player scripting with variable arguments.
   * 
   * This method allows the gadget to communicate with player scripting.
   * If the appropriate scripting is in place in the currently running template, 
   * calling this method will initiate a callback which can be acted upon in player script.
   * 
   * @param args - Variable number of arguments to pass to the callback (max 5 arguments)
   * 
   * ```typescript
   * // Send a simple callback
   * this.client.callback('test', 'data');
   * 
   * // Send multiple parameters
   * this.client.callback('action', 'value1', 'value2', { data: 'object' });
   * ```
   */
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

  /**
   * Gets the user preferences interface exposed by the Google Gadgets API.
   * 
   * This method provides access to gadget preferences which can be configured
   * in the Revel Digital CMS. Use this to retrieve user-configurable settings
   * for your gadget.
   * 
   * @returns The Gadgets API Prefs object for accessing preference values
   * 
   * ```typescript
   * constructor(public client: PlayerClientService) {
   *   const prefs = client.getPrefs();
   *   const myString = prefs.getString('myStringPref');
   *   const myNumber = prefs.getInt('myNumberPref');
   *   const myBool = prefs.getBool('myBoolPref');
   * }
   * ```
   * 
   * @see {@link https://developers.google.com/gadgets/docs/basic} Google Gadgets API documentation
   */
  public getPrefs(): gadgets.Prefs {

    return new window['gadgets']['Prefs']();
  }

  /**
   * Gets the current device time in ISO8601 format.
   * 
   * Current device time is determined by the device timezone assigned to the device in the CMS.
   * This is useful for displaying time-sensitive content or scheduling operations based on
   * the device's local time rather than browser time.
   * 
   * @param date - Optional. If supplied, will translate the supplied date/time to device time based on respective timezones
   * @returns Promise resolving to date/time in ISO8601 format
   * 
   * ```typescript
   * // Get current device time
   * const currentTime = await this.client.getDeviceTime();
   * console.log('Device time:', currentTime);
   * 
   * // Convert a specific date to device time
   * const specificDate = new Date('2023-01-01T12:00:00Z');
   * const deviceTime = await this.client.getDeviceTime(specificDate);
   * ```
   */
  public async getDeviceTime(date?: Date): Promise<string> {

    const client = await this.getClient();

    if (date !== undefined) {
      return client.getDeviceTime(date);
    }
    return client.getDeviceTime();
  }

  /**
   * Gets the timezone name currently assigned to the device.
   * 
   * @returns Promise resolving to the timezone name (e.g., "America/New_York")
   * 
   * ```typescript
   * const timezoneName = await this.client.getDeviceTimeZoneName();
   * console.log('Device timezone:', timezoneName);
   * ```
   */
  public async getDeviceTimeZoneName(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneName();
  }

  /**
   * Gets the timezone ID currently assigned to the device.
   * 
   * @returns Promise resolving to the timezone ID
   * 
   * ```typescript
   * const timezoneId = await this.client.getDeviceTimeZoneID();
   * console.log('Device timezone ID:', timezoneId);
   * ```
   */
  public async getDeviceTimeZoneID(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneID();
  }

  /**
   * Gets the numerical offset from GMT of the timezone currently assigned to the device.
   * 
   * @returns Promise resolving to the timezone offset in hours (e.g., -5 for EST)
   * 
   * ```typescript
   * const offset = await this.client.getDeviceTimeZoneOffset();
   * console.log('Device timezone offset:', offset, 'hours from GMT');
   * ```
   */
  public async getDeviceTimeZoneOffset(): Promise<number> {

    const client = await this.getClient();

    return client.getDeviceTimeZoneOffset();
  }

  /**
   * Gets the language code of the language currently assigned to the device.
   * 
   * @returns Promise resolving to the language code (e.g., "en-US", "fr-FR")
   * 
   * ```typescript
   * const languageCode = await this.client.getLanguageCode();
   * console.log('Device language:', languageCode);
   * // Use for localization
   * this.loadLanguageResources(languageCode);
   * ```
   */
  public async getLanguageCode(): Promise<string> {

    const client = await this.getClient();

    return client.getLanguageCode();
  }

  /**
   * Gets the unique Revel Digital device key associated with the device.
   * 
   * The device key is a unique identifier for this specific player device
   * and can be used for device-specific operations or remote commands.
   * 
   * @returns Promise resolving to the device key string
   * 
   * ```typescript
   * const deviceKey = await this.client.getDeviceKey();
   * console.log('Device key:', deviceKey);
   * ```
   */
  public async getDeviceKey(): Promise<string> {

    const client = await this.getClient();

    return client.getDeviceKey();
  }

  /**
   * Sends a command to the local player device.
   * 
   * Commands can be used to control various aspects of the player or trigger
   * specific behaviors. The command is processed by the local player only.
   * 
   * @param name - The command name/identifier
   * @param arg - The command argument/payload
   * 
   * ```typescript
   * // Send a simple command
   * this.client.sendCommand('refresh', '');
   * 
   * // Send a command with data
   * this.client.sendCommand('setVolume', '50');
   * 
   * // Send a command with JSON data
   * this.client.sendCommand('configure', JSON.stringify({ setting: 'value' }));
   * ```
   */
  public sendCommand(name: string, arg: string): void {

    this.getClient().then((client) => {
      client.sendCommand(name, arg);
    })
  }

  /**
   * Sends a command to remote player devices with the specified device keys.
   * 
   * Remote commands allow cross-device communication within the same Revel Digital account.
   * This is useful for synchronized displays, device coordination, or remote control scenarios.
   * 
   * Note: Remote commands can only be delivered to devices within the same account as the sender device.
   * 
   * @param deviceKeys - Array of target device keys to send the command to
   * @param name - The command name/identifier
   * @param arg - The command argument/payload
   * 
   * ```typescript
   * // Send command to specific devices
   * const targetDevices = ['device-key-1', 'device-key-2'];
   * this.client.sendRemoteCommand(targetDevices, 'syncAction', 'start');
   * 
   * // Broadcast to multiple devices
   * this.client.sendRemoteCommand(
   *   ['lobby-display', 'kiosk-1', 'kiosk-2'], 
   *   'updateContent', 
   *   JSON.stringify({ contentId: '12345' })
   * );
   * ```
   */
  public sendRemoteCommand(deviceKeys: string[], name: string, arg: string): void {

    this.getClient().then((client) => {
      client.sendRemoteCommand(deviceKeys, name, arg);
    });
  }

  /**
   * Logs an analytics event for use with AdHawk analytics and reporting.
   * 
   * Events are used for tracking various metrics including usage statistics, 
   * player condition, state changes, user interactions, and custom business metrics.
   * These events can be viewed in the Revel Digital analytics dashboard.
   * 
   * @param eventName - Unique name for this event (should be descriptive and consistent)
   * @param properties - Optional map of user-defined properties to associate with this event
   * 
   * ```typescript
   * // Simple event tracking
   * this.client.track('gadget_loaded');
   * 
   * // Event with properties
   * this.client.track('user_interaction', {
   *   action: 'button_click',
   *   button_id: 'start_button',
   *   timestamp: new Date().toISOString()
   * });
   * 
   * // Performance tracking
   * this.client.track('content_displayed', {
   *   content_type: 'video',
   *   duration: 30,
   *   quality: 'HD'
   * });
   * ```
   */
  public track(eventName: string, properties?: IEventProperties): void {

    this.getClient().then((client) => {
      client.track(eventName, JSON.stringify(properties));
    })
  }

  /**
   * Initiates a timed event for duration tracking.
   * 
   * Timed events are useful for tracking the duration of operations or user interactions.
   * This method must be followed by a call to track() with the same event name to complete
   * the timing measurement. The duration will be automatically calculated and included
   * in the event properties.
   * 
   * @param eventName - Unique name for this timed event (must match the subsequent track() call)
   * 
   * ```typescript
   * // Start timing an event
   * this.client.timeEvent('video_playback');
   * 
   * // ... video plays for some duration ...
   * 
   * // End timing and log the event with duration
   * this.client.track('video_playback', {
   *   video_id: 'abc123',
   *   quality: 'HD'
   * }); // Duration will be automatically added
   * 
   * // Example for user interaction timing
   * this.client.timeEvent('form_completion');
   * // ... user fills out form ...
   * this.client.track('form_completion', { form_type: 'contact' });
   * ```
   */
  public timeEvent(eventName: string): void {

    this.getClient().then((client) => {
      client.timeEvent(eventName);
    })
  }

  /**
   * Creates a new analytics event session for grouping related events.
   * 
   * A session is a way of grouping events together for analysis. Each event tracked
   * after calling this method will have the same session ID until a new session is created.
   * Session IDs are randomly generated unless explicitly provided.
   * 
   * This is useful for tracking user journeys, workflow completion, or grouping
   * related interactions within a specific time period.
   * 
   * @param id - Optional user-supplied session ID. If not provided, a random session ID will be generated
   * 
   * ```typescript
   * // Start a new session with auto-generated ID
   * this.client.newEventSession();
   * this.client.track('session_start');
   * this.client.track('user_action_1');
   * this.client.track('user_action_2');
   * 
   * // Start a session with custom ID
   * this.client.newEventSession('user-workflow-12345');
   * this.client.track('workflow_start');
   * this.client.track('step_completed', { step: 1 });
   * 
   * // Start a new session for different workflow
   * this.client.newEventSession();
   * this.client.track('different_workflow_start');
   * ```
   */
  public newEventSession(id?: string): void {

    this.getClient().then((client) => {
      if (id !== undefined) {
        client.newEventSession();
      } else {
        client.newEventSession(id);
      }
    })
  }

  /**
   * Gets the root folder path utilized by this player device.
   * 
   * This returns the base directory path where the Revel Digital player
   * stores its files and resources on the local device.
   * 
   * @returns Promise resolving to the path of the root folder
   * 
   * ```typescript
   * const rootPath = await this.client.getRevelRoot();
   * console.log('Player root directory:', rootPath);
   * // Use for constructing file paths or understanding storage structure
   * ```
   */
  public async getRevelRoot(): Promise<string> {

    const client = await this.getClient();

    return client.getRevelRoot();
  }

  /**
   * Gets a map of commands currently active for this device.
   * 
   * This returns the current command configuration that defines how the device
   * responds to various command triggers and remote commands.
   * 
   * @returns Promise resolving to a map of currently active commands
   * 
   * ```typescript
   * const commandMap = await this.client.getCommandMap();
   * console.log('Active commands:', commandMap);
   * 
   * // Check if specific command is available
   * if (commandMap['customCommand']) {
   *   console.log('Custom command is available');
   * }
   * ```
   */
  public async getCommandMap(): Promise<any> {

    const client = await this.getClient();

    return JSON.parse(await client.getCommandMap());
  }

  /**
   * Signals to the player that this gadget has completed its visualization.
   * 
   * This method notifies the player that the current gadget has finished its
   * content display or interaction cycle. The player can then proceed with
   * the next item in a playlist if applicable, or handle the completion
   * according to its configuration.
   * 
   * Call this method when your gadget has completed its intended function,
   * such as finishing an animation, completing a form, or reaching a natural
   * stopping point.
   * 
   * ```typescript
   * // After completing an animation
   * private onAnimationComplete(): void {
   *   this.client.finish();
   * }
   * 
   * // After user interaction is complete
   * private onFormSubmitted(): void {
   *   this.saveFormData();
   *   this.client.finish();
   * }
   * 
   * // After a timed display period
   * setTimeout(() => {
   *   this.client.finish();
   * }, 30000); // 30 seconds
   * ```
   */
  public finish(): void {

    this.getClient().then((client) => {

      client.finish();
    })
  }

  /**
   * Checks if the gadget is running in preview mode.
   * 
   * Preview mode is enabled when the gadget is being edited in the Revel Digital CMS,
   * tested in the gadget editor, or otherwise not running in a normal player environment.
   * This is useful for providing different behavior during development/testing versus
   * production deployment.
   * 
   * @returns Promise resolving to true if running in preview mode, false if running on actual player
   * 
   * ```typescript
   * const isPreview = await this.client.isPreviewMode();
   * 
   * if (isPreview) {
   *   console.log('Running in preview mode - using mock data');
   *   this.loadMockData();
   * } else {
   *   console.log('Running on player device - using live data');
   *   this.loadLiveData();
   * }
   * 
   * // Show different UI in preview
   * this.showPreviewIndicator = isPreview;
   * ```
   */
  public async isPreviewMode(): Promise<boolean> {

    const client = await this.getClient();

    return client instanceof NoopClient;
  }

  /**
   * Gets detailed information about the device running the player.
   * 
   * Returns comprehensive device details including name, registration key, type,
   * service date, language, timezone, tags, and location information. This data
   * is configured in the Revel Digital CMS for each device.
   * 
   * @returns Promise resolving to device details object, or null if not available
   * 
   * ```typescript
   * const device = await this.client.getDevice();
   * 
   * if (device) {
   *   console.log('Device name:', device.name);
   *   console.log('Device type:', device.deviceType);
   *   console.log('Location:', device.location.city, device.location.state);
   *   console.log('Tags:', device.tags);
   *   
   *   // Use device info for customization
   *   if (device.location.country === 'US') {
   *     this.loadUSContent();
   *   }
   *   
   *   // Check device capabilities based on type
   *   if (device.deviceType === 'android') {
   *     this.enableTouchFeatures();
   *   }
   * }
   * ```
   */
  public async getDevice(): Promise<IDevice | null> {

    const client = await this.getClient();

    let obj: any = JSON.parse(<string>await client.getDevice());

    const device: IDevice[] = [obj].map((device: any) => {

      return {
        name: device.name,
        registrationKey: device.key,
        deviceType: device.devicetype,
        enteredService: new Date(device.enteredservice),
        langCode: device.langcode,
        timeZone: device.timezone,
        tags: device.description?.split('\n'),
        location: {
          city: device.location?.city,
          state: device.location?.state,
          country: device.location?.country,
          postalCode: device.location?.postalcode,
          address: device.location?.address,
          latitude: device.location?.latitude,
          longitude: device.location?.longitude
        }
      }
    });
    return device[0];
  }

  /**
   * Gets the width of the visualization area in pixels.
   * 
   * This returns the available width for content display, which may be
   * different from the full screen width depending on player configuration
   * and template layout.
   * 
   * @returns Promise resolving to width in pixels, or null if not available
   * 
   * ```typescript
   * const width = await this.client.getWidth();
   * 
   * if (width) {
   *   console.log('Available width:', width, 'pixels');
   *   
   *   // Adapt content layout based on width
   *   if (width < 800) {
   *     this.enableMobileLayout();
   *   } else {
   *     this.enableDesktopLayout();
   *   }
   * }
   * ```
   */
  public async getWidth(): Promise<number | null> {

    const client = await this.getClient();

    return client.getWidth();
  }

  /**
   * Gets the height of the visualization area in pixels.
   * 
   * This returns the available height for content display, which may be
   * different from the full screen height depending on player configuration
   * and template layout.
   * 
   * @returns Promise resolving to height in pixels, or null if not available
   * 
   * ```typescript
   * const height = await this.client.getHeight();
   * 
   * if (height) {
   *   console.log('Available height:', height, 'pixels');
   *   
   *   // Calculate aspect ratio for responsive design
   *   const width = await this.client.getWidth();
   *   const aspectRatio = width / height;
   *   this.adjustContentForAspectRatio(aspectRatio);
   * }
   * ```
   */
  public async getHeight(): Promise<number | null> {

    const client = await this.getClient();

    return client.getHeight();
  }

  /**
   * Gets the duration of the currently playing content item.
   * 
   * This method is only applicable when the gadget is associated with a playlist
   * and returns the duration assigned to the current playlist item. The duration
   * determines how long the content should be displayed before moving to the next item.
   * 
   * @returns Promise resolving to duration in milliseconds, or null if not applicable/available
   * 
   * ```typescript
   * const duration = await this.client.getDuration();
   * 
   * if (duration) {
   *   console.log('Content duration:', duration, 'milliseconds');
   *   
   *   // Set up auto-finish timer
   *   setTimeout(() => {
   *     this.client.finish();
   *   }, duration);
   *   
   *   // Show progress indicator
   *   this.startProgressIndicator(duration);
   * }
   * ```
   */
  public async getDuration(): Promise<number | null> {

    const client = await this.getClient();

    return client.getDuration();
  }

  /**
   * Gets the current version of the Revel Digital SDK.
   * 
   * @returns Promise resolving to the SDK version string
   * 
   * ```typescript
   * const version = await this.client.getSdkVersion();
   * console.log('SDK Version:', version);
   * 
   * // Use for compatibility checks or logging
   * this.client.track('gadget_loaded', { sdkVersion: version });
   * ```
   */
  public async getSdkVersion(): Promise<string> {

    return Promise.resolve(version);
  }

  /**
   * Applies configuration preferences to the gadget (preview mode only).
   * 
   * This method is only available when running in preview mode (typically during
   * gadget development or testing in the CMS). It allows applying configuration
   * changes that would normally come from the gadget's preference settings.
   * 
   * @param prefs - Dictionary of preference key-value pairs to apply
   * 
   * ```typescript
   * if (await this.client.isPreviewMode()) {
   *   // Apply test configuration in preview
   *   await this.client.applyConfig({
   *     'title': 'Test Title',
   *     'backgroundColor': '#ff0000',
   *     'showBorder': true,
   *     'refreshInterval': 30
   *   });
   * }
   * ```
   */
  public async applyConfig(prefs: IDictionary<any>) {

    if (await this.isPreviewMode()) {
      const client = await this.getClient();
      client.applyConfig(prefs);
    } else {
      console.log(
        '%capplyConfig() is only available in preview mode.',
        'background-color:blue; color:yellow;'
      );
    }
  }

  // ---
  // PRIVATE METHODS.
  // ---
  /** @ignore */
  private getClient(): Promise<IClient> {

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
    this.clientPromise = new Promise<IClient>(
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

/**
 * Mock implementation of the IClient interface.
 * 
 * This class provides a no-operation (NOOP) implementation of the client API
 * that allows consuming code to function normally even when the actual player
 * API is not available. This typically occurs during development, testing,
 * or when the player script is blocked by ad-blockers.
 * 
 * All methods in this class either return null/empty values or perform no
 * operations, allowing gadgets to function without errors while providing
 * appropriate fallback behavior.
 * 
 * @private
 */
class NoopClient implements IClient {

  constructor() {

    console.log(
      '%cClient API not available, falling back to mock API',
      'background-color:blue; color:yellow;'
    );
  }

  public callback(...args: any[]): void {

    // NOOP implement, nothing to do....
  }

  public getDeviceTime(date?: Date): Promise<string> {

    return Promise.resolve(new Date().toISOString());
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

  public async getCommandMap(): Promise<string> {

    return Promise.resolve('{}');
  }

  public finish(): void {

    // NOOP implement, nothing to do....
  }

  public async getDevice(): Promise<string | null> {

    return Promise.resolve(null);
  }

  public async getWidth(): Promise<number | null> {

    return Promise.resolve(null);
  }

  public async getHeight(): Promise<number | null> {

    return Promise.resolve(null);
  }

  public async getDuration(): Promise<number | null> {

    return Promise.resolve(null);
  }

  public async getSdkVersion(): Promise<string> {

    return Promise.resolve(version);
  }

  public applyConfig(prefs: IDictionary<any>): void {

    let evt = { type: 'applyConfig', prefs: prefs, isOpener: window.opener !== null };

    if (window.opener) {
      window.opener.postMessage(
        JSON.stringify(evt),
        '*'
      );
    } else {
      window.parent.postMessage(
        JSON.stringify(evt),
        '*'
      );
    }
  }
}
