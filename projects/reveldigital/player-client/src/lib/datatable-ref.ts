import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import {
  IDataTableChangeEvent,
  IDataTableColumn,
  IDataTableOptions,
  IDataTablePref,
  IDataTableQueryParams,
  IDataTableResult,
  IDataTableSchema
} from './interfaces/datatable.interface';

/**
 * Angular-friendly wrapper around the global `gadgets.reveldigital.datatable` library.
 *
 * Provides typed Promise-based methods and RxJS Observables for real-time events.
 * All event emissions run inside Angular's zone to ensure change detection triggers.
 *
 * ```typescript
 * const dt = this.client.createDataTable('tbl_menu_items');
 *
 * // Fetch rows
 * const result = await dt.getRows({ sort: 'price', sortDir: 'asc' });
 *
 * // Real-time updates
 * dt.rowUpdated$.subscribe(change => console.log('Updated:', change));
 *
 * // Cleanup
 * dt.dispose();
 * ```
 */
export class DataTableRef {

  /** Emits when an existing row is modified. */
  public rowUpdated$ = new Subject<IDataTableChangeEvent>();

  /** Emits when a new row is added. */
  public rowCreated$ = new Subject<IDataTableChangeEvent>();

  /** Emits when a row is removed. */
  public rowDeleted$ = new Subject<IDataTableChangeEvent>();

  /** @ignore */
  private _instance: any;

  /** @ignore */
  private _zone: NgZone;

  /** @ignore */
  private _onRowUpdated!: (change: IDataTableChangeEvent) => void;
  /** @ignore */
  private _onRowCreated!: (change: IDataTableChangeEvent) => void;
  /** @ignore */
  private _onRowDeleted!: (change: IDataTableChangeEvent) => void;

  /**
   * Creates a new DataTableRef.
   *
   * @param tableId - The data table ID (e.g. 'tbl_menu_items')
   * @param zone - Angular NgZone for ensuring change detection on callbacks
   * @param options - Optional configuration overrides
   * @throws Error if the global datatable library is not loaded
   */
  constructor(tableId: string, zone: NgZone, options?: IDataTableOptions) {

    this._zone = zone;

    const lib = (window as any).gadgets?.['reveldigital.datatable'];

    if (!lib || typeof lib.create !== 'function') {
      throw new Error(
        'RevelDigital DataTable library is not available. ' +
        'Ensure the datatable feature is enabled for this gadget.'
      );
    }

    this._instance = lib.create(tableId, options);
    this._wireEvents();
  }

  /**
   * Fetches rows from the data table.
   *
   * @param params - Optional query parameters (filter, sort, pagination)
   * @returns Promise resolving to the result set
   *
   * ```typescript
   * const result = await dt.getRows({
   *   filter: { category: 'Entree', price: { op: 'lte', value: 25 } },
   *   sort: 'itemName',
   *   sortDir: 'asc',
   *   pageSize: 20
   * });
   * ```
   */
  public getRows(params?: IDataTableQueryParams): Promise<IDataTableResult> {
    return this._instance.getRows(params);
  }

  /**
   * Fetches the table schema (column definitions and metadata).
   *
   * @returns Promise resolving to the table schema
   */
  public getSchema(): Promise<IDataTableSchema> {
    return this._instance.getSchema();
  }

  /**
   * Gets visible (non-hidden) columns from the table schema.
   *
   * @returns Promise resolving to an array of visible column definitions
   */
  public getVisibleColumns(): Promise<IDataTableColumn[]> {
    return this._instance.getVisibleColumns();
  }

  /**
   * Fetches rows with hidden column data stripped.
   *
   * @param params - Optional query parameters (same as getRows)
   * @returns Promise resolving to the result set with hidden fields removed
   */
  public getVisibleRows(params?: IDataTableQueryParams): Promise<IDataTableResult> {
    return this._instance.getVisibleRows(params);
  }

  /**
   * Starts polling for changes at the given interval.
   * Emits on `rowUpdated$` when new data is detected.
   *
   * @param intervalMs - Polling interval in milliseconds (default 30000)
   */
  public startPolling(intervalMs?: number): void {
    this._instance.startPolling(intervalMs);
  }

  /**
   * Stops polling for changes.
   */
  public stopPolling(): void {
    this._instance.stopPolling();
  }

  /**
   * Releases all resources: stops polling, closes the real-time connection,
   * removes event listeners, and completes all RxJS observables.
   */
  public dispose(): void {
    this._instance.off('rowUpdated', this._onRowUpdated);
    this._instance.off('rowCreated', this._onRowCreated);
    this._instance.off('rowDeleted', this._onRowDeleted);

    this._instance.dispose();

    this.rowUpdated$.complete();
    this.rowCreated$.complete();
    this.rowDeleted$.complete();
  }

  /** @ignore */
  static _fromInstance(instance: any, zone: NgZone): DataTableRef {
    const ref = Object.create(DataTableRef.prototype) as DataTableRef;
    ref.rowUpdated$ = new Subject<IDataTableChangeEvent>();
    ref.rowCreated$ = new Subject<IDataTableChangeEvent>();
    ref.rowDeleted$ = new Subject<IDataTableChangeEvent>();
    ref._instance = instance;
    ref._zone = zone;
    ref._wireEvents();
    return ref;
  }

  /** @ignore */
  private _wireEvents(): void {
    this._onRowUpdated = (change: IDataTableChangeEvent) => {
      this._zone.run(() => this.rowUpdated$.next(change));
    };
    this._onRowCreated = (change: IDataTableChangeEvent) => {
      this._zone.run(() => this.rowCreated$.next(change));
    };
    this._onRowDeleted = (change: IDataTableChangeEvent) => {
      this._zone.run(() => this.rowDeleted$.next(change));
    };

    this._instance.on('rowUpdated', this._onRowUpdated);
    this._instance.on('rowCreated', this._onRowCreated);
    this._instance.on('rowDeleted', this._onRowDeleted);
  }
}


/**
 * Wrapper around a data table created from a gadget preference value.
 *
 * Automatically configures filter and sort settings from the preference,
 * and provides a `getFilteredRows()` convenience method that applies them.
 *
 * ```typescript
 * const cfg = this.client.createDataTableFromPref(prefs.getString('rdDataTable'));
 *
 * // Fetch rows with auto-wired filter + sort from the preference
 * const result = await cfg.getFilteredRows();
 *
 * // Access the underlying DataTableRef for schema, events, etc.
 * cfg.dataTable.rowUpdated$.subscribe(change => console.log(change));
 *
 * // Cleanup
 * cfg.dispose();
 * ```
 */
export class DataTablePrefRef {

  /** The underlying DataTableRef with full access to schema, events, polling, etc. */
  public readonly dataTable: DataTableRef;

  /** The parsed preference object. */
  public readonly pref: IDataTablePref;

  /** @ignore */
  private _config: any;

  /**
   * Creates a new DataTablePrefRef from a gadget preference JSON string.
   *
   * @param prefValue - The raw gadget preference string (JSON)
   * @param zone - Angular NgZone for ensuring change detection on callbacks
   * @param options - Optional configuration overrides
   * @throws Error if the global datatable library is not loaded
   */
  constructor(prefValue: string, zone: NgZone, options?: IDataTableOptions) {

    const lib = (window as any).gadgets?.['reveldigital.datatable'];

    if (!lib || typeof lib.createFromPref !== 'function') {
      throw new Error(
        'RevelDigital DataTable library is not available. ' +
        'Ensure the datatable feature is enabled for this gadget.'
      );
    }

    this._config = lib.createFromPref(prefValue, options);
    this.pref = this._config.pref;
    this.dataTable = DataTableRef._fromInstance(this._config.dt, zone);
  }

  /**
   * Fetches rows with the filter and sort settings from the preference automatically applied.
   * Additional query parameters can override or supplement the preference settings.
   *
   * @param params - Optional additional query parameters
   * @returns Promise resolving to the result set
   *
   * ```typescript
   * // Use preference defaults
   * const result = await cfg.getFilteredRows();
   *
   * // Override page size
   * const page = await cfg.getFilteredRows({ pageSize: 10 });
   * ```
   */
  public getFilteredRows(params?: IDataTableQueryParams): Promise<IDataTableResult> {
    return this._config.getFilteredRows(params);
  }

  /**
   * Releases all resources held by the underlying DataTableRef.
   */
  public dispose(): void {
    this.dataTable.dispose();
  }
}
