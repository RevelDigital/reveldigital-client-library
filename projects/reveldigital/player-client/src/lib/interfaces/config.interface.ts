/**
 * Interface representing configuration settings and events for the Revel Digital system.
 * 
 * This interface defines the structure for configuration-related communication
 * between gadgets and the player, particularly during design-time configuration
 * and preference management operations.
 * 
 * Configuration events are typically used when:
 * - Opening configuration dialogs in the CMS
 * - Applying preference changes from configuration UI
 * - Communicating between parent and child windows during config operations
 * 
 * ```typescript
 * // Handle configuration events
 * this.client.onPostMessage$.subscribe((config: IConfig) => {
 *   if (config.type === ConfigType.ApplyConfig) {
 *     this.applyPreferences(config.prefs);
 *   }
 * });
 * ```
 * 
 * @export
 * @interface IConfig
 * @since 1.0.0
 */
export interface IConfig {

    /**
     * Dictionary of preference key-value pairs containing configuration settings.
     * 
     * This object contains all the preference values that have been configured
     * for the gadget. The keys correspond to preference names defined in the
     * gadget's configuration schema, and values can be of any type.
     * 
     * ```typescript
     * const config: IConfig = {
     *   prefs: {
     *     'title': 'My Gadget Title',
     *     'backgroundColor': '#ff0000',
     *     'refreshInterval': 30,
     *     'showBorder': true,
     *     'apiEndpoint': 'https://api.example.com/data'
     *   },
     *   type: ConfigType.ApplyConfig,
     *   isOpener: false
     * };
     * ```
     */
    prefs: IDictionary<any>;

    /**
     * The type of configuration operation being performed.
     * 
     * Indicates whether this is a request to open configuration UI
     * or an instruction to apply new configuration values.
     * 
     * @see ConfigType enum for available values
     */
    type: ConfigType;

    /**
     * Indicates if this configuration event originated from a popup window opener.
     * 
     * When true, this suggests the configuration change originated from a popup
     * configuration window and may need to be propagated to the parent window.
     * This is used internally for handling window communication during config operations.
     * 
     * ```typescript
     * if (config.isOpener) {
     *   // Propagate config changes from popup to parent window
     *   window.parent.postMessage(configData, '*');
     * }
     * ```
     */
    isOpener: boolean;
}

/**
 * Generic dictionary interface for key-value pairs.
 * 
 * This interface provides a flexible way to represent objects with
 * string keys and values of any type. It's commonly used for configuration
 * preferences, command arguments, and other dynamic data structures.
 * 
 * @template T - The type of values stored in the dictionary
 * 
 * ```typescript
 * // String dictionary
 * const stringPrefs: IDictionary<string> = {
 *   'title': 'My Title',
 *   'description': 'My Description'
 * };
 * 
 * // Mixed type dictionary
 * const mixedPrefs: IDictionary<any> = {
 *   'title': 'My Title',
 *   'count': 42,
 *   'enabled': true
 * };
 * ```
 * 
 * @export
 * @interface IDictionary
 */
export interface IDictionary<T> {
    [Key: string]: T;
}

/**
 * Enumeration of configuration operation types.
 * 
 * Defines the different types of configuration-related operations
 * that can be performed between gadgets and the player environment.
 * 
 * @export
 * @enum ConfigType
 * @since 1.0.0
 */
export enum ConfigType {
    /**
     * Request to open the configuration interface.
     * 
     * This type indicates that the configuration UI should be displayed,
     * typically in response to a user action or system event.
     * 
     * ```typescript
     * // Trigger config UI opening
     * const openConfigEvent: IConfig = {
     *   prefs: {},
     *   type: ConfigType.OpenConfig,
     *   isOpener: false
     * };
     * ```
     */
    OpenConfig = 'openConfig',

    /**
     * Instruction to apply new configuration values.
     * 
     * This type indicates that the provided preferences should be
     * applied to the gadget's configuration, typically after the
     * user has made changes in the configuration UI.
     * 
     * ```typescript
     * // Apply new configuration
     * const applyConfigEvent: IConfig = {
     *   prefs: {
     *     'title': 'Updated Title',
     *     'interval': 60
     *   },
     *   type: ConfigType.ApplyConfig,
     *   isOpener: true
     * };
     * ```
     */
    ApplyConfig = 'applyConfig'
}
