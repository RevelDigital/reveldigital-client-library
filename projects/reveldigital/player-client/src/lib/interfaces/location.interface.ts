
/**
 * Interface representing comprehensive geographical and address information for a device location.
 * 
 * This interface defines the complete location data structure used throughout
 * the Revel Digital system for device positioning, content localization,
 * and geographic analytics. Location information enables:
 * 
 * - **Geographic Content Targeting**: Deliver region-specific content
 * - **Localization**: Adjust language, currency, and cultural content
 * - **Analytics Segmentation**: Group and analyze by geographic regions
 * - **Weather Integration**: Display local weather conditions
 * - **Distance Calculations**: Proximity-based features and routing
 * - **Compliance**: Regional regulatory and legal requirements
 * 
 * ```typescript
 * // Access device location information
 * const device = await this.client.getDevice();
 * 
 * if (device?.location) {
 *   const location = device.location;
 *   
 *   // Display local information
 *   console.log(`Device located at: ${location.address}`);
 *   console.log(`${location.city}, ${location.state} ${location.postalCode}`);
 *   console.log(`${location.country}`);
 *   
 *   // Use coordinates for mapping
 *   this.showOnMap(location.latitude, location.longitude);
 *   
 *   // Load region-specific content
 *   if (location.country === 'US') {
 *     this.loadUSContent();
 *   } else if (location.country === 'CA') {
 *     this.loadCanadianContent();
 *   }
 *   
 *   // City-specific customization
 *   switch (location.city) {
 *     case 'New York':
 *       this.enableSubwayAlerts();
 *       break;
 *     case 'London':
 *       this.showTubeStatus();
 *       break;
 *   }
 * }
 * ```
 * 
 * @export
 * @interface ILocation
 * @since 1.0.0
 */
export interface ILocation {
    /**
     * Geographic latitude coordinate in decimal degrees.
     * 
     * Represents the north-south position on Earth's surface.
     * Positive values indicate northern hemisphere, negative values
     * indicate southern hemisphere.
     * 
     * ```typescript
     * // Examples of latitude values:
     * // 40.7128 (New York City)
     * // 51.5074 (London)
     * // -33.8688 (Sydney)
     * // 35.6762 (Tokyo)
     * 
     * const lat = location.latitude;
     * const hemisphere = lat >= 0 ? 'Northern' : 'Southern';
     * console.log(`Location is in the ${hemisphere} hemisphere`);
     * ```
     */
    latitude: number;

    /**
     * Geographic longitude coordinate in decimal degrees.
     * 
     * Represents the east-west position on Earth's surface.
     * Positive values indicate eastern hemisphere, negative values
     * indicate western hemisphere.
     * 
     * ```typescript
     * // Examples of longitude values:
     * // -74.0060 (New York City)
     * // -0.1278 (London)  
     * // 151.2093 (Sydney)
     * // 139.6503 (Tokyo)
     * 
     * const lng = location.longitude;
     * const hemisphere = lng >= 0 ? 'Eastern' : 'Western';
     * console.log(`Location is in the ${hemisphere} hemisphere`);
     * 
     * // Calculate distance between two points
     * const distance = this.calculateDistance(
     *   location.latitude, location.longitude,
     *   otherLat, otherLng
     * );
     * ```
     */
    longitude: number;

    /**
     * City name where the device is located.
     * 
     * The municipal or city-level administrative division.
     * Used for city-specific content, local services, and
     * urban area customizations.
     * 
     * "New York", "London", "Tokyo", "Sydney"
     */
    city: string;

    /**
     * State, province, or regional administrative division.
     * 
     * The sub-national administrative unit such as state (US),
     * province (Canada), or region (EU). Format varies by country.
     * 
     * "California", "Ontario", "Bavaria", "New South Wales"
     */
    state: string;

    /**
     * Full street address of the device location.
     * 
     * Complete physical address including street number, street name,
     * and any additional address components. Used for precise location
     * identification and delivery purposes.
     * 
     * ```typescript
     * // Typical address formats:
     * // "123 Main Street, Suite 456"
     * // "1600 Pennsylvania Avenue NW"
     * // "10 Downing Street"
     * // "1-1-1 Chiyoda"
     * 
     * if (location.address) {
     *   console.log(`Full address: ${location.address}`);
     *   this.displayAddressOnMap(location.address);
     * }
     * ```
     */
    address: string;

    /**
     * Country name or country code.
     * 
     * The nation-state where the device is located. May be provided
     * as full country name or standardized country code (ISO 3166).
     * Used for country-specific content, legal compliance, and
     * international customizations.
     * 
     * ```typescript
     * // Country name formats:
     * // "United States", "Canada", "United Kingdom", "Japan"
     * // Or country codes:
     * // "US", "CA", "GB", "JP"
     * 
     * // Handle different formats
     * const countryCode = location.country.length === 2 
     *   ? location.country 
     *   : this.getCountryCode(location.country);
     *   
     * this.loadCountrySpecificContent(countryCode);
     * ```
     */
    country: string;

    /**
     * Postal or ZIP code for the location.
     * 
     * The postal delivery code used by the local postal service.
     * Format varies by country (ZIP codes in US, postal codes in Canada/UK, etc.).
     * Used for local delivery, regional targeting, and demographic analysis.
     * 
     * ```typescript
     * // Postal code formats by country:
     * // US: "90210", "10001-1234"
     * // Canada: "K1A 0A6", "M5V 3L9"  
     * // UK: "SW1A 1AA", "M1 1AA"
     * // Germany: "10115", "80331"
     * 
     * // Use for regional content targeting
     * if (location.postalCode.startsWith('90')) {
     *   this.loadLosAngelesContent();
     * }
     * 
     * // Validate postal code format
     * const isValidUS = /^\d{5}(-\d{4})?$/.test(location.postalCode);
     * ```
     */
    postalCode: string;
}
