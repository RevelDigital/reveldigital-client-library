import { NgZone } from '@angular/core';
import { decode } from 'html-entities';
import { IPowerBIOptions, IPowerBIPref } from './interfaces/powerbi.interface';

/**
 * Angular-friendly wrapper around the global `gadgets.reveldigital.powerbi` library.
 *
 * Provides typed Promise-based methods for embedding Power BI reports and dashboards.
 *
 * ```typescript
 * const pbi = this.client.createPowerBI({
 *   workspaceId: '...',
 *   reportId: '...',
 *   container: this.containerEl.nativeElement
 * });
 *
 * // Embed the report
 * await pbi.embed();
 *
 * // Refresh the token
 * await pbi.refresh();
 *
 * // Cleanup
 * pbi.dispose();
 * ```
 */
export class PowerBIRef {

  /** @ignore */
  private _instance: any;

  /** @ignore */
  private _zone: NgZone;

  /**
   * Creates a new PowerBIRef.
   *
   * @param options - Power BI embed configuration
   * @param zone - Angular NgZone for ensuring change detection on callbacks
   * @throws Error if the global Power BI library is not loaded
   */
  constructor(options: IPowerBIOptions, zone: NgZone) {

    this._zone = zone;

    const lib = (window as any).gadgets?.['reveldigital.powerbi'];

    if (!lib || typeof lib.create !== 'function') {
      throw new Error(
        'RevelDigital PowerBI library is not available. ' +
        'Ensure the Power BI feature is enabled for this gadget.'
      );
    }

    this._instance = lib.create(options);
  }

  /**
   * Fetches the embed configuration from the API and renders the Power BI
   * content in the container element.
   *
   * @returns Promise resolving to the embed configuration returned by the API
   */
  public embed(): Promise<any> {
    return this._zone.run(() => this._instance.embed());
  }

  /**
   * Refreshes the embed token without re-rendering.
   *
   * @returns Promise resolving when the token has been refreshed
   */
  public refresh(): Promise<void> {
    return this._zone.run(() => this._instance.refresh());
  }

  /**
   * Releases all resources: stops the token refresh timer and disposes
   * the embedded Power BI component.
   */
  public dispose(): void {
    this._instance.dispose();
  }

  /** @ignore */
  static _fromInstance(instance: any, zone: NgZone): PowerBIRef {
    const ref = Object.create(PowerBIRef.prototype) as PowerBIRef;
    ref._instance = instance;
    ref._zone = zone;
    return ref;
  }
}


/**
 * Wrapper around a Power BI embed created from a gadget preference value.
 *
 * Automatically configures workspace, report/dashboard, and display settings
 * from the preference.
 *
 * ```typescript
 * const pbi = this.client.createPowerBIFromPref(
 *   prefs.getString('rdPowerBI'),
 *   this.containerEl.nativeElement
 * );
 *
 * // Embed with preference settings
 * await pbi.embed();
 *
 * // Cleanup
 * pbi.dispose();
 * ```
 */
export class PowerBIPrefRef {

  /** The underlying PowerBIRef with full access to embed, refresh, etc. */
  public readonly powerBI: PowerBIRef;

  /** The parsed preference object. */
  public readonly pref: IPowerBIPref;

  /**
   * Creates a new PowerBIPrefRef from a gadget preference JSON string.
   *
   * @param prefValue - The raw gadget preference string (JSON)
   * @param container - DOM element to embed into
   * @param zone - Angular NgZone for ensuring change detection on callbacks
   * @param extraOptions - Additional options to merge
   * @throws Error if the global Power BI library is not loaded
   */
  constructor(prefValue: string, container: HTMLElement, zone: NgZone, extraOptions?: Partial<IPowerBIOptions>) {

    const lib = (window as any).gadgets?.['reveldigital.powerbi'];

    if (!lib || typeof lib.createFromPref !== 'function') {
      throw new Error(
        'RevelDigital PowerBI library is not available. ' +
        'Ensure the Power BI feature is enabled for this gadget.'
      );
    }

    // gadgets.Prefs.getString() returns HTML-encoded values, decode before parsing
    const decoded = decode(prefValue);

    const instance = lib.createFromPref(decoded, container, extraOptions);
    this.pref = this._parsePref(decoded);
    this.powerBI = PowerBIRef._fromInstance(instance, zone);
  }

  /**
   * Fetches the embed configuration and renders the Power BI content.
   *
   * @returns Promise resolving to the embed configuration
   */
  public embed(): Promise<any> {
    return this.powerBI.embed();
  }

  /**
   * Refreshes the embed token without re-rendering.
   *
   * @returns Promise resolving when the token has been refreshed
   */
  public refresh(): Promise<void> {
    return this.powerBI.refresh();
  }

  /**
   * Releases all resources held by the underlying PowerBIRef.
   */
  public dispose(): void {
    this.powerBI.dispose();
  }

  /** @ignore */
  private _parsePref(decoded: string): IPowerBIPref {
    try {
      return JSON.parse(decoded);
    } catch {
      return {};
    }
  }
}
