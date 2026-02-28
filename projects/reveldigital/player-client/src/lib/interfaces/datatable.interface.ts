/**
 * Filter operators supported by data table queries.
 *
 * - Simple equality: `{ columnKey: 'value' }`
 * - Operator-based: `{ columnKey: { op: 'contains', value: 'search' } }`
 * - Range: `{ columnKey: { op: 'inRange', from: 5, to: 20 } }`
 */
export type DataTableFilterOp =
  | 'eq'
  | 'neq'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'contains'
  | 'notContains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'positive'
  | 'negative'
  | 'inRange'
  | 'outOfRange';

/**
 * Operator-based filter expression for a single column.
 */
export interface IDataTableFilterOperator {
  op: DataTableFilterOp;
  value?: any;
  from?: any;
  to?: any;
}

/**
 * Filter value for a single column.
 * Can be a simple equality value (string/number/boolean) or an operator expression.
 */
export type DataTableFilterValue = string | number | boolean | IDataTableFilterOperator;

/**
 * Filter map keyed by column key.
 *
 * Supports logical combinations:
 * - **AND** (default): multiple properties in a single object
 *   `{ status: 'active', price: { op: 'lte', value: 25 } }`
 * - **OR**: wrap each condition in a `$or` array
 *   `{ $or: [{ status: 'active' }, { status: 'pending' }] }`
 * - **Mixed**: AND conditions alongside an OR group
 *   `{ $or: [{ status: 'active' }, { status: 'pending' }], price: { op: 'gt', value: 0 } }`
 */
export interface IDataTableFilter {
  /** OR group: rows matching any condition in the array. */
  $or?: Array<{ [columnKey: string]: DataTableFilterValue }>;
  [columnKey: string]: DataTableFilterValue | Array<{ [columnKey: string]: DataTableFilterValue }> | undefined;
}

/**
 * Column data types returned by the table schema.
 */
export type DataTableColumnType = 'text' | 'number' | 'boolean' | 'date' | 'image' | 'hidden';

/**
 * Options for creating a DataTable instance.
 */
export interface IDataTableOptions {
  /** Override auto-resolved device registration key. */
  registrationKey?: string;
  /** Override the API base URL. */
  baseUrl?: string;
  /** SignalR hub URL. Set to `null` to disable real-time updates. */
  signalRUrl?: string | null;
}

/**
 * Query parameters for fetching rows from a data table.
 */
export interface IDataTableQueryParams {
  /** Filter rules keyed by column key. */
  filter?: IDataTableFilter;
  /** Column key to sort by. */
  sort?: string;
  /** Sort direction. */
  sortDir?: 'asc' | 'desc';
  /** Results per page (max 100). */
  pageSize?: number;
  /** Pagination cursor from a previous result. */
  continuationToken?: string;
  /** Comma-separated column keys to include. */
  fields?: string;
}

/**
 * A single row returned from the data table API.
 */
export interface IDataTableRow {
  /** Row ID. */
  id: string;
  /** Sort order value. */
  sortOrder: number;
  /** Column key-value pairs. */
  data: { [key: string]: any };
  /** ISO 8601 last-modified timestamp. */
  updatedAt: string;
}

/**
 * Result set returned by `getRows()` and `getVisibleRows()`.
 */
export interface IDataTableResult {
  /** Row objects. */
  data: IDataTableRow[];
  /** Total matching rows across all pages. */
  totalCount: number;
  /** Token for fetching the next page, or `null` if no more pages. */
  continuationToken: string | null;
  /** ISO 8601 cache expiry timestamp. */
  cacheUntil: string;
  /** `true` when data is unchanged since the last fetch (ETag match). */
  notModified?: boolean;
}

/**
 * Column definition returned by the table schema.
 */
export interface IDataTableColumn {
  /** Column ID. */
  id: string;
  /** Display name. */
  name: string;
  /** Data key used in `row.data`. */
  key: string;
  /** Column data type. */
  type: DataTableColumnType;
  /** Whether the column is required. */
  required: boolean;
  /** Whether the column supports sorting. */
  sortable: boolean;
  /** Column-specific options. */
  options: any;
}

/**
 * Table schema including column definitions and metadata.
 */
export interface IDataTableSchema {
  /** Table ID. */
  id: string;
  /** Table name. */
  name: string;
  /** Table description. */
  description: string;
  /** Column definitions. */
  columns: IDataTableColumn[];
  /** Total rows in the table. */
  rowCount: number;
  /** ISO 8601 last-modified timestamp. */
  updatedAt: string;
}

/**
 * Change event emitted for real-time data table updates.
 */
export interface IDataTableChangeEvent {
  /** The table that changed. */
  tableId: string;
  /** The affected row ID. */
  rowId: string;
  /** Row data (present for created/updated events). */
  data?: any;
  /** The type of change. */
  action: 'update' | 'create' | 'delete' | 'poll';
}

/**
 * A single filter rule within a datatable preference.
 */
export interface IDataTablePrefFilterRule {
  /** Column key to filter on. */
  columnKey: string;
  /** Filter operator (defaults to 'eq'). */
  operator?: DataTableFilterOp;
  /** Value to compare against. */
  value?: any;
}

/**
 * Parsed datatable gadget preference as serialized by the template editor.
 */
export interface IDataTablePref {
  /** The data table ID. */
  tableId?: string;
  /** Primary column key. */
  columnKey?: string;
  /** Filter rules (new multi-filter format). */
  filters?: IDataTablePrefFilterRule[];
  /** Logical combination for filters. */
  filterLogic?: 'and' | 'or';
  /** Column key to sort by. */
  sortColumnKey?: string;
  /** Sort direction. */
  sortDirection?: 'asc' | 'desc';
  /** @deprecated Legacy single-filter column key. Use `filters` instead. */
  filterColumnKey?: string;
  /** @deprecated Legacy single-filter operator. Use `filters` instead. */
  filterOperator?: DataTableFilterOp;
  /** @deprecated Legacy single-filter value. Use `filters` instead. */
  filterValue?: any;
}
