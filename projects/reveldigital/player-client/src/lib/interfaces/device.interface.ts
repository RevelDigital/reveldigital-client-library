import { ILocation } from "./location.interface";

/**
 * Interface representing a Revel Digital player device with comprehensive details.
 * 
 * This interface defines the complete information available about a device
 * running the Revel Digital player software. It includes identification,
 * configuration, hardware details, and location information as configured
 * in the Revel Digital CMS.
 * 
 * Device information is used for:
 * - Content customization based on device capabilities
 * - Location-based content delivery
 * - Analytics and reporting segmentation
 * - Remote device management and targeting
 * - Timezone and localization operations
 * 
 * ```typescript
 * // Get and use device information
 * const device = await this.client.getDevice();
 * 
 * if (device) {
 *   // Customize content based on device type
 *   if (device.deviceType === 'android') {
 *     this.enableTouchInteractions();
 *   }
 *   
 *   // Use location for content filtering
 *   if (device.location?.country === 'US') {
 *     this.loadUSContent();
 *   }
 *   
 *   // Check device tags for special configurations
 *   if (device.tags.includes('kiosk')) {
 *     this.enableKioskMode();
 *   }
 * }
 * ```
 * 
 * @export
 * @interface IDevice
 * @since 1.0.0
 */
export interface IDevice {

    /**
     * The human-readable name assigned to this device.
     * 
     * This is the display name configured in the Revel Digital CMS
     * for easy identification and management of the device.
     * 
     * "Lobby Display", "Conference Room Screen", "Kiosk #1"
     */
    name: string;

    /**
     * The unique registration key identifying this device.
     * 
     * This is the primary unique identifier for the device within
     * the Revel Digital system. It's used for device authentication,
     * remote command targeting, and system operations.
     * 
     * "ABCD-1234-EFGH-5678"
     */
    registrationKey: string;

    /**
     * The type/platform of the device hardware.
     * 
     * Indicates the operating system or platform type of the device,
     * which can be used to enable platform-specific features or content.
     * 
     * "windows", "android", "linux", "chromeos"
     */
    deviceType: string;

    /**
     * The date when this device was first registered and entered service.
     * 
     * This timestamp indicates when the device was initially set up
     * and began operating within the Revel Digital system.
     */
    enteredService: Date;

    /**
     * The language/locale code configured for this device.
     * 
     * Used for internationalization and localization of content.
     * May be undefined if not specifically configured.
     * 
     * "en-US", "fr-FR", "de-DE", "ja-JP"
     */
    langCode?: string;

    /**
     * The timezone identifier assigned to this device.
     * 
     * Defines the local timezone for time-sensitive operations
     * and content scheduling. May be undefined if not configured.
     * 
     * "America/New_York", "Europe/London", "Asia/Tokyo"
     */
    timeZone?: string;

    /**
     * Array of descriptive tags associated with this device.
     * 
     * Tags provide a flexible way to categorize and group devices
     * for management, content targeting, and operational purposes.
     * Tags are typically derived from the device description field
     * in the CMS (split by newlines).
     * 
     * ```typescript
     * // Common tag examples
     * tags: ["kiosk", "lobby", "interactive"]
     * tags: ["conference-room", "building-a", "floor-2"]
     * tags: ["retail", "storefront", "promotional"]
     * 
     * // Check for specific capabilities
     * if (device.tags.includes('touch-enabled')) {
     *   this.enableTouchFeatures();
     * }
     * ```
     */
    tags: Array<string>;

    /**
     * Geographic location information for this device.
     * 
     * Contains detailed location data including coordinates, address,
     * and administrative divisions. This information can be used for
     * location-based content delivery, analytics, and regional customization.
     * May be undefined if location information is not configured.
     * 
     * @see ILocation interface for detailed location properties
     * 
     * ```typescript
     * if (device.location) {
     *   const { city, state, country } = device.location;
     *   console.log(`Device located in ${city}, ${state}, ${country}`);
     *   
     *   // Use for weather, news, or regional content
     *   this.loadLocalContent(device.location);
     * }
     * ```
     */
    location?: ILocation;
}
