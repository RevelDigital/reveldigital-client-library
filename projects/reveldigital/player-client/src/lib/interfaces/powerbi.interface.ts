/**
 * Options for creating a PowerBI embed instance.
 */
export interface IPowerBIOptions {
  /** Power BI workspace/group ID. */
  workspaceId: string;
  /** Report ID (for report embedding). */
  reportId?: string;
  /** Dashboard ID (for dashboard embedding). */
  dashboardId?: string;
  /** DOM element to embed into. */
  container: HTMLElement;
  /** Embed type: 'report' or 'dashboard'. Defaults to 'report'. */
  type?: 'report' | 'dashboard';
  /** Initial page name for reports. */
  pageName?: string;
  /** Show the filter pane. Defaults to false. */
  showFilterPane?: boolean;
  /** Show the page navigation pane. Defaults to false. */
  showNavPane?: boolean;
  /** Override auto-resolved device registration key. */
  registrationKey?: string;
  /** Override the API base URL. */
  baseUrl?: string;
  /** Token refresh interval in milliseconds (default: 55 min). */
  tokenRefreshInterval?: number;
}

/**
 * Parsed Power BI gadget preference as serialized by the template editor.
 */
export interface IPowerBIPref {
  /** Power BI workspace/group ID. */
  workspaceId?: string;
  /** Report ID. */
  reportId?: string;
  /** Dashboard ID. */
  dashboardId?: string;
  /** Embed type: 'report' or 'dashboard'. */
  type?: 'report' | 'dashboard';
  /** Initial page name for reports. */
  pageName?: string;
  /** Show the filter pane. */
  showFilterPane?: boolean;
  /** Show the page navigation pane. */
  showNavPane?: boolean;
}
