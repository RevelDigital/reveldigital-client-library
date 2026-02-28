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
 */
export interface IDataTableFilter {
  [columnKey: string]: DataTableFilterValue;
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
