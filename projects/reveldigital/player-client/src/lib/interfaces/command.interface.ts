/**
 * Interface representing a command sent to or from the Revel Digital player.
 * 
 * Commands are the primary mechanism for triggering actions and behaviors
 * in the player environment. They consist of a name identifier and an
 * optional argument payload that provides additional context or parameters.
 * 
 * Commands can originate from:
 * - Remote devices via sendRemoteCommand()
 * - Template scripting via player callbacks
 * - Playlist actions and transitions
 * - Manual triggers from the CMS interface
 * 
 * ```typescript
 * // Subscribe to incoming commands
 * this.client.onCommand$.subscribe((command: ICommand) => {
 *   switch (command.name) {
 *     case 'refresh':
 *       this.refreshContent();
 *       break;
 *     case 'updateConfig':
 *       this.applyNewConfig(JSON.parse(command.arg));
 *       break;
 *     case 'customAction':
 *       this.handleCustomAction(command.arg);
 *       break;
 *   }
 * });
 * ```
 * 
 * @export
 * @interface ICommand
 * @since 1.0.0
 */
export interface ICommand {
    /**
     * The command identifier or action name.
     * 
     * This is a string that uniquely identifies the type of command or action
     * to be performed. Command names should be descriptive and consistent
     * across the application.
     * 
     * Common command names:
     * - "refresh" - Reload content or data
     * - "restart" - Restart the application or component
     * - "updateConfig" - Apply new configuration settings
     * - "setVolume" - Adjust audio volume
     * - "loadContent" - Load specific content by ID
     * - "sync" - Synchronize with other devices
     */
    name: string;

    /**
     * Optional command argument or payload data.
     * 
     * This string contains any additional data required by the command.
     * For complex data structures, this is typically a JSON-encoded string
     * that can be parsed by the command handler.
     * 
     * ```typescript
     * // Simple string argument
     * { name: "setVolume", arg: "75" }
     * 
     * // JSON payload for complex data
     * { 
     *   name: "loadContent", 
     *   arg: JSON.stringify({ 
     *     contentId: "abc123", 
     *     transition: "fade",
     *     duration: 5000 
     *   })
     * }
     * 
     * // Empty argument for parameterless commands
     * { name: "refresh", arg: "" }
     * ```
     */
    arg: string;
}
