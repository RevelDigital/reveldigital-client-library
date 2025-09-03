/**
 * Interface representing flexible properties for analytics events.
 * 
 * This interface defines a flexible structure for attaching custom properties
 * and metadata to analytics events. It allows gadgets to provide rich contextual
 * information alongside event tracking for detailed analytics and reporting.
 * 
 * Event properties are used to:
 * - Provide context and metadata for analytics events
 * - Enable detailed filtering and segmentation in reports
 * - Track custom business metrics and KPIs
 * - Debug and troubleshoot gadget behavior
 * - Correlate events across user sessions and devices
 * 
 * ```typescript
 * // Simple properties
 * const simpleProps: IEventProperties = {
 *   action: 'button_click',
 *   buttonId: 'submit'
 * };
 * 
 * // Rich event data
 * const detailedProps: IEventProperties = {
 *   // User interaction details
 *   action: 'content_interaction',
 *   interactionType: 'swipe',
 *   direction: 'left',
 *   
 *   // Performance metrics
 *   loadTime: 1250,
 *   renderTime: 85,
 *   
 *   // Business context
 *   contentId: 'promo-2023-12',
 *   contentType: 'advertisement',
 *   campaign: 'holiday-sales',
 *   
 *   // Technical details
 *   deviceInfo: {
 *     screenWidth: 1920,
 *     screenHeight: 1080,
 *     userAgent: 'RevelDigital/1.0'
 *   },
 *   
 *   // Timestamps and session data
 *   timestamp: new Date().toISOString(),
 *   sessionId: 'sess-abc123',
 *   userId: 'user-456',
 *   
 *   // Custom business metrics
 *   conversionValue: 29.99,
 *   category: 'electronics',
 *   tags: ['featured', 'sale', 'popular']
 * };
 * 
 * // Track events with properties
 * this.client.track('user_interaction', simpleProps);
 * this.client.track('content_viewed', detailedProps);
 * ```
 * 
 * @export
 * @interface IEventProperties
 * @since 1.0.0
 */
export interface IEventProperties {
    /**
     * Flexible key-value pairs for event metadata and context.
     * 
     * This index signature allows any string key to be associated with
     * any value type, providing maximum flexibility for event properties.
     * 
     * ## Common Property Categories:
     * 
     * **User Interaction Properties:**
     * - `action`: Type of action performed (click, swipe, scroll, etc.)
     * - `element`: UI element identifier
     * - `coordinates`: Mouse/touch coordinates
     * - `duration`: Time spent on action
     * 
     * **Content Properties:**
     * - `contentId`: Unique content identifier  
     * - `contentType`: Type of content (video, image, text, etc.)
     * - `contentTitle`: Human-readable content title
     * - `contentUrl`: Source URL if applicable
     * 
     * **Performance Properties:**
     * - `loadTime`: Time to load content (milliseconds)
     * - `renderTime`: Time to render content (milliseconds)
     * - `errorCount`: Number of errors encountered
     * - `retryCount`: Number of retry attempts
     * 
     * **Session Properties:**
     * - `sessionId`: Current user session identifier
     * - `userId`: User identifier if available
     * - `deviceId`: Device identifier
     * - `timestamp`: Event timestamp
     * 
     * **Business Properties:**
     * - `campaign`: Marketing campaign identifier
     * - `category`: Business category or classification
     * - `value`: Monetary or business value
     * - `conversion`: Conversion tracking information
     * 
     * ```typescript
     * // User interaction tracking
     * {
     *   action: 'video_play',
     *   videoId: 'vid-123',
     *   videoTitle: 'Product Demo',
     *   playPosition: 0,
     *   quality: 'HD'
     * }
     * 
     * // Performance monitoring
     * {
     *   operation: 'api_call',
     *   endpoint: '/api/content',
     *   responseTime: 245,
     *   statusCode: 200,
     *   cacheHit: true
     * }
     * 
     * // Business metrics
     * {
     *   event: 'conversion',
     *   conversionType: 'signup',
     *   value: 0,
     *   source: 'qr_code',
     *   campaign: 'spring2023'
     * }
     * ```
     */
    [key: string]: any;
}
