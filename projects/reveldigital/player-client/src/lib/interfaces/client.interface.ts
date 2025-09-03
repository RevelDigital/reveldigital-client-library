import { IDictionary } from "./config.interface";

/**
 * Core interface defining the contract for Revel Digital player client implementations.
 * 
 * This interface represents the complete API available for gadgets and web applications
 * to interact with the Revel Digital player environment. It provides methods for:
 * 
 * - **Device Information**: Access device details, timezone, language, and hardware specs
 * - **Communication**: Send commands locally and to remote devices
 * - **Analytics**: Track events, measure performance, and manage user sessions
 * - **Player Control**: Manage gadget lifecycle and player transitions
 * - **Configuration**: Apply and manage gadget preferences and settings
 * 
 * Implementations of this interface handle the actual communication with the player
 * environment, while providing a consistent API for client code regardless of the
 * underlying platform or deployment scenario.
 * 
 * ```typescript
 * // Typical usage through PlayerClientService
 * class MyGadget {
 *   constructor(private client: PlayerClientService) {}
 *   
 *   async initialize() {
 *     const device = await this.client.getDevice();
 *     const time = await this.client.getDeviceTime();
 *     this.client.track('gadget_initialized', { deviceType: device.deviceType });
 *   }
 * }
 * ```
 * 
 * @export
 * @interface IClient
 * @since 1.0.0
 */
export interface IClient {

    /**
     * Sends a callback to the player with optional arguments.
     * 
     * This is the primary method for bi-directional communication between the gadget
     * and player scripting. When called, it triggers any callback handlers that have
     * been configured in the player template scripting.
     * 
     * @param args - Variable number of arguments to pass to the player callback handler
     * 
     * ```typescript
     * // Simple callback without arguments
     * client.callback();
     * 
     * // Callback with data
     * client.callback('user_action', { buttonId: 'start', timestamp: Date.now() });
     * 
     * // Multiple arguments
     * client.callback('event_name', 'event_data', { additional: 'context' });
     * ```
     */
    callback(...args: any[]): void;

    /**
     * Gets the current device time in the device's configured timezone.
     * 
     * Returns the current time adjusted to the timezone assigned to the device
     * in the Revel Digital CMS. If a date is provided, it will be converted
     * to the device's timezone.
     * 
     * @param date - Optional date to convert to device time. If omitted, returns current device time
     * @returns Promise resolving to ISO8601 formatted date string in device timezone
     * 
     * ```typescript
     * // Get current device time
     * const now = await client.getDeviceTime();
     * 
     * // Convert specific time to device timezone  
     * const utcTime = new Date('2023-12-25T12:00:00Z');
     * const localTime = await client.getDeviceTime(utcTime);
     * ```
     */
    getDeviceTime(date?: Date): Promise<string | null>;

    /**
     * Gets the timezone name currently assigned to the device.
     * 
     * Returns the human-readable timezone name as configured in the device
     * settings within the Revel Digital CMS.
     * 
     * @returns Promise resolving to timezone name (e.g., "America/New_York", "Europe/London")
     * 
     * ```typescript
     * const timezoneName = await client.getDeviceTimeZoneName();
     * console.log(`Device timezone: ${timezoneName}`);
     * ```
     */
    getDeviceTimeZoneName(): Promise<string | null>;

    /**
     * Gets the timezone identifier currently assigned to the device.
     * 
     * Returns the timezone ID/identifier as configured for this device.
     * This may be different from the timezone name depending on the system configuration.
     * 
     * @returns Promise resolving to timezone identifier
     * 
     * ```typescript
     * const timezoneId = await client.getDeviceTimeZoneID();
     * // Use for timezone-specific operations
     * ```
     */
    getDeviceTimeZoneID(): Promise<string | null>;

    /**
     * Gets the numerical offset from GMT for the device's configured timezone.
     * 
     * Returns the number of hours the device's timezone is offset from GMT.
     * Positive values indicate timezones east of GMT, negative values indicate
     * timezones west of GMT.
     * 
     * @returns Promise resolving to timezone offset in hours (e.g., -5 for EST, +1 for CET)
     * 
     * ```typescript
     * const offset = await client.getDeviceTimeZoneOffset();
     * console.log(`Device is ${offset} hours from GMT`);
     * ```
     */
    getDeviceTimeZoneOffset(): Promise<number | null>;

    /**
     * Gets the language code currently assigned to the device.
     * 
     * Returns the language/locale code configured for this device in the CMS.
     * This can be used for localization and internationalization purposes.
     * 
     * @returns Promise resolving to language code (e.g., "en-US", "fr-FR", "de-DE")
     * 
     * ```typescript
     * const langCode = await client.getLanguageCode();
     * if (langCode === 'fr-FR') {
     *   this.loadFrenchContent();
     * }
     * ```
     */
    getLanguageCode(): Promise<string | null>;

    /**
     * Gets the unique device key (registration key) for this player device.
     * 
     * The device key is a unique identifier assigned to each device when it's
     * registered with the Revel Digital system. This key can be used for
     * device-specific operations and remote command targeting.
     * 
     * @returns Promise resolving to the device's unique registration key
     * 
     * ```typescript
     * const deviceKey = await client.getDeviceKey();
     * console.log(`This device key: ${deviceKey}`);
     * // Use for analytics or device-specific configuration
     * ```
     */
    getDeviceKey(): Promise<string | null>;

    /**
     * Sends a command to the local player device.
     * 
     * Commands are used to trigger specific behaviors or actions on the player.
     * The command is processed immediately by the local player only.
     * 
     * @param name - The command identifier/name
     * @param arg - Command argument or payload data
     * 
     * ```typescript
     * // Simple command
     * client.sendCommand('restart', '');
     * 
     * // Command with parameters
     * client.sendCommand('setVolume', '75');
     * client.sendCommand('loadContent', JSON.stringify({ url: 'http://example.com' }));
     * ```
     */
    sendCommand(name: string, arg: string): void;

    /**
     * Sends a command to one or more remote player devices.
     * 
     * Enables cross-device communication by sending commands to other devices
     * within the same Revel Digital account. Useful for synchronized displays,
     * coordinated actions, or remote device control.
     * 
     * @param deviceKeys - Array of target device keys to receive the command
     * @param name - The command identifier/name  
     * @param arg - Command argument or payload data
     * 
     * ```typescript
     * // Send to multiple devices
     * const targets = ['lobby-display', 'kiosk-001', 'kiosk-002'];
     * client.sendRemoteCommand(targets, 'updateContent', 'new-content-id');
     * 
     * // Broadcast synchronization command
     * client.sendRemoteCommand(['device1', 'device2'], 'sync', Date.now().toString());
     * ```
     */
    sendRemoteCommand(deviceKeys: string[], name: string, arg: string): void;

    /**
     * Tracks an analytics event with optional properties.
     * 
     * Events are logged for analytics and reporting purposes, providing insights
     * into gadget usage, performance, and user interactions. For timed events,
     * the duration is automatically calculated from the timeEvent() call to this track() call.
     * 
     * @param eventName - Unique identifier for the event
     * @param properties - Optional JSON string containing event properties and metadata
     * 
     * ```typescript
     * // Simple event
     * client.track('gadget_loaded', '');
     * 
     * // Event with properties
     * const props = JSON.stringify({ 
     *   action: 'button_click', 
     *   button_id: 'submit',
     *   timestamp: Date.now() 
     * });
     * client.track('user_interaction', props);
     * ```
     */
    track(eventName: string, properties?: string): void;

    /**
     * Begins timing measurement for a named event.
     * 
     * This starts a timer for performance measurement. The timer is stopped
     * and duration calculated when track() is called with the same event name.
     * Multiple concurrent timers can be active for different event names.
     * 
     * @param eventName - Unique identifier for the timed event
     * 
     * ```typescript
     * // Start timing a video playback
     * client.timeEvent('video_playback');
     * // ... video plays for some duration ...
     * client.track('video_playback', JSON.stringify({ videoId: 'abc123' }));
     * // Duration is automatically included in the tracked event
     * ```
     */
    timeEvent(eventName: string): void;

    /**
     * Creates a new analytics event session for grouping related events.
     * 
     * Sessions provide a way to group related events together for analysis.
     * Each subsequent event tracked will be associated with this session
     * until a new session is started.
     * 
     * @param id - Optional custom session identifier. If not provided, a random ID is generated
     * 
     * ```typescript
     * // Start new session with auto-generated ID
     * client.newEventSession();
     * client.track('session_start', '');
     * 
     * // Start session with custom ID
     * client.newEventSession('user-123-workflow');
     * client.track('workflow_begin', '');
     * ```
     */
    newEventSession(id?: string): void;

    /**
     * Gets the root directory path where the Revel Digital system stores files.
     * 
     * Returns the base file system path used by the player for storing
     * content, cache, and other system files on the local device.
     * 
     * @returns Promise resolving to the root directory path
     * 
     * ```typescript
     * const rootPath = await client.getRevelRoot();
     * console.log(`System root: ${rootPath}`);
     * // Use for file operations or path construction
     * ```
     */
    getRevelRoot(): Promise<string | null>;

    /**
     * Gets the current command map configuration for this device.
     * 
     * Returns a JSON string containing the mapping of command names to their
     * configurations as defined in the device's current template or playlist.
     * 
     * @returns Promise resolving to JSON string of command mappings
     * 
     * ```typescript
     * const commandMapJson = await client.getCommandMap();
     * const commandMap = JSON.parse(commandMapJson);
     * if (commandMap['customCommand']) {
     *   console.log('Custom command is available');
     * }
     * ```
     */
    getCommandMap(): Promise<string | null>;

    /**
     * Signals that the gadget has completed its visualization and the player can proceed.
     * 
     * This notifies the player that the current content has finished displaying
     * and it's safe to transition to the next item in a playlist or perform
     * other scheduled actions.
     * 
     * ```typescript
     * // After animation completes
     * setTimeout(() => {
     *   client.finish();
     * }, 5000);
     * 
     * // After user interaction
     * button.onclick = () => {
     *   this.processAction();
     *   client.finish();
     * };
     * ```
     */
    finish(): void;

    /**
     * Gets comprehensive information about the current device.
     * 
     * Returns detailed device information including registration details,
     * hardware type, location, and configuration as a JSON string.
     * 
     * @returns Promise resolving to JSON string containing device information
     * 
     * ```typescript
     * const deviceJson = await client.getDevice();
     * const device = JSON.parse(deviceJson);
     * console.log(`Device: ${device.name} (${device.devicetype})`);
     * console.log(`Location: ${device.location?.city}, ${device.location?.state}`);
     * ```
     */
    getDevice(): Promise<string | null>;

    /**
     * Gets the width of the available visualization area in pixels.
     * 
     * Returns the display width available for gadget content, which may
     * differ from screen resolution based on template layout and player configuration.
     * 
     * @returns Promise resolving to width in pixels
     * 
     * ```typescript
     * const width = await client.getWidth();
     * if (width < 800) {
     *   this.enableMobileLayout();
     * }
     * ```
     */
    getWidth(): Promise<number | null>;

    /**
     * Gets the height of the available visualization area in pixels.
     * 
     * Returns the display height available for gadget content, which may
     * differ from screen resolution based on template layout and player configuration.
     * 
     * @returns Promise resolving to height in pixels
     * 
     * ```typescript
     * const height = await client.getHeight();
     * const width = await client.getWidth();
     * const aspectRatio = width / height;
     * this.adjustLayout(aspectRatio);
     * ```
     */
    getHeight(): Promise<number | null>;

    /**
     * Gets the duration assigned to the current playlist item.
     * 
     * Returns the time duration (in milliseconds) that this content should
     * be displayed when running as part of a playlist. Only applicable
     * when the gadget is associated with a playlist.
     * 
     * @returns Promise resolving to duration in milliseconds
     * 
     * ```typescript
     * const duration = await client.getDuration();
     * if (duration) {
     *   // Auto-finish after the assigned duration
     *   setTimeout(() => client.finish(), duration);
     * }
     * ```
     */
    getDuration(): Promise<number | null>;

    /**
     * Gets the version of the Revel Digital SDK.
     * 
     * Returns the current version string of the SDK/client library.
     * 
     * @returns Promise resolving to version string
     * 
     * ```typescript
     * const version = await client.getSdkVersion();
     * console.log(`SDK Version: ${version}`);
     * ```
     */
    getSdkVersion(): Promise<string | null>;

    /**
     * Applies configuration preferences to the gadget (design-time only).
     * 
     * This method is used during gadget design/configuration to apply
     * preference changes. It sends the updated preferences to the CMS
     * for assignment to the gadget configuration. Only available during
     * design-time operations.
     * 
     * @param prefs - Dictionary of preference key-value pairs to apply
     * 
     * ```typescript
     * // Apply configuration changes in design mode
     * client.applyConfig({
     *   'title': 'Updated Title',
     *   'backgroundColor': '#ff0000',
     *   'autoRefresh': true
     * });
     * ```
     */
    applyConfig(prefs: IDictionary<any>): void;
}
