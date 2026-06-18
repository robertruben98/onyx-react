import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import "./data-table.scss";

export type RowKey = string | number;
export type CellAlign = "start" | "center" | "end";
export type SortDirection = "asc" | "desc";
export type DataTableMode = "paginated" | "virtual";
export type SelectionMode = "none" | "single" | "multiple";

/** One level of the (multi-)column sort. */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Column definition for {@link DataTable}. */
export interface DataTableColumn<T> {
  /** Unique id (sort state, header id). */
  id: string;
  /** Header label. */
  header: string;
  /** Field accessor for the cell's text value. */
  field?: keyof T;
  /** Computed value accessor (alternative to `field`). */
  value?: (row: T) => unknown;
  /** Custom cell renderer; receives the row and the computed cell value. */
  cell?: (row: T, value: unknown) => ReactNode;
  /** Horizontal alignment. */
  align?: CellAlign;
  /** CSS track size for this column (e.g. '8rem', 'minmax(0,2fr)'). */
  width?: string;
  /** Whether the column can be sorted. */
  sortable?: boolean;
  /** Sort key accessor; defaults to the `value`/`field` value. */
  sortAccessor?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Row data (all rows; processed client-side). */
  rows?: T[];
  /** Row identity: a field name or a function. Defaults to `row.id`. */
  rowKey?: keyof T | ((row: T) => RowKey);
  /** Loading state. */
  loading?: boolean;
  /** Text shown when there are no rows. */
  emptyText?: string;
  /** Accessible name for the grid. */
  caption?: string;
  /** Allow additive multi-column sort via Shift+click. */
  multiSort?: boolean;
  /** Layout mode: paginated footer vs virtual scroll. */
  mode?: DataTableMode;
  /** Options for the rows-per-page control. */
  pageSizeOptions?: number[];
  /** Row selection mode. */
  selectable?: SelectionMode;
  /** Row height in px (virtual scroll item size). */
  rowHeight?: number;
  /** Virtual scroll viewport height (CSS length). */
  viewportHeight?: string;
  /** Max height for paginated mode; enables internal scroll with sticky header. */
  maxHeight?: string;

  /** Active sort levels (two-way: pair with `onSortChange`). */
  sort?: SortState[];
  /** Emitted when the active sort levels change. */
  onSortChange?: (sort: SortState[]) => void;
  /** Current page (0-based) (two-way: pair with `onPageIndexChange`). */
  pageIndex?: number;
  /** Emitted when the page index changes. */
  onPageIndexChange?: (pageIndex: number) => void;
  /** Rows per page (two-way: pair with `onPageSizeChange`). */
  pageSize?: number;
  /** Emitted when the page size changes. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Selected row keys (two-way: pair with `onSelectedChange`). */
  selected?: Set<RowKey>;
  /** Emitted when the selection changes. */
  onSelectedChange?: (selected: Set<RowKey>) => void;

  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Internal hook: controlled-or-uncontrolled state mirror of Angular `model()`.
 *
 * In Angular a `model()` can always be written internally; a passed-in value is
 * only an *initial* unless the parent wires up two-way binding. To mirror that,
 * a prop counts as fully controlled only when BOTH a value and its `onChange`
 * are supplied. A value with no `onChange` seeds the initial state while still
 * allowing internal writes (e.g. `pageSize={5}` without `onPageSizeChange`).
 */
function useModel<S>(
  controlled: S | undefined,
  onChange: ((next: S) => void) | undefined,
  initial: S,
): [S, (next: S) => void] {
  const isControlled = controlled !== undefined && onChange !== undefined;
  const [internal, setInternal] = useState<S>(
    controlled !== undefined ? controlled : initial,
  );
  const value = isControlled ? (controlled as S) : internal;
  const set = useCallback(
    (next: S) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, set];
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Accessible, token-driven data grid (role=grid). React port of the Onyx UI
 * Angular `ui-data-table`: column configuration, sorting, pagination, row
 * selection (single/multiple/select-all), virtual scroll, sticky header,
 * empty/loading states and full 2D roving-tabindex keyboard navigation.
 */
export function DataTable<T>({
  columns,
  rows = [],
  rowKey,
  loading = false,
  emptyText = "No data",
  caption = "",
  multiSort = false,
  mode = "paginated",
  pageSizeOptions = [10, 25, 50],
  selectable = "none",
  rowHeight = 44,
  viewportHeight = "400px",
  maxHeight = "",
  sort: sortProp,
  onSortChange,
  pageIndex: pageIndexProp,
  onPageIndexChange,
  pageSize: pageSizeProp,
  onPageSizeChange,
  selected: selectedProp,
  onSelectedChange,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useModel<SortState[]>(sortProp, onSortChange, []);
  const [pageIndex, setPageIndex] = useModel(
    pageIndexProp,
    onPageIndexChange,
    0,
  );
  const [pageSize, setPageSize] = useModel(pageSizeProp, onPageSizeChange, 10);
  const [selected, setSelected] = useModel<Set<RowKey>>(
    selectedProp,
    onSelectedChange,
    new Set(),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  /** Active grid cell for roving-tabindex keyboard nav (row 0 = header). */
  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });

  const rowKeyOf = useCallback(
    (row: T): RowKey => {
      if (typeof rowKey === "function") return rowKey(row);
      if (rowKey != null) return row[rowKey] as unknown as RowKey;
      return (row as { id?: RowKey }).id ?? JSON.stringify(row);
    },
    [rowKey],
  );

  const cellValue = useCallback(
    (col: DataTableColumn<T>, row: T): unknown => {
      if (col.value) return col.value(row);
      if (col.field != null) return row[col.field];
      return "";
    },
    [],
  );

  const sortValue = useCallback(
    (col: DataTableColumn<T>, row: T): unknown => {
      if (col.sortAccessor) return col.sortAccessor(row);
      return cellValue(col, row);
    },
    [cellValue],
  );

  /** Rows after applying the active sort. */
  const sorted = useMemo(() => {
    if (!sort.length) return rows;
    const cols = new Map(columns.map((c) => [c.id, c]));
    return [...rows].sort((a, b) => {
      for (const level of sort) {
        const col = cols.get(level.columnId);
        if (!col) continue;
        const cmp = compare(sortValue(col, a), sortValue(col, b));
        if (cmp !== 0) return level.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [sort, rows, columns, sortValue]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(0, pageIndex), pageCount - 1);

  /** Rows currently rendered (sorted, then paged in paginated mode). */
  const visibleRows = useMemo(() => {
    if (mode === "virtual") return sorted;
    const start = currentPage * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [mode, sorted, currentPage, pageSize]);

  const showFooter = mode === "paginated" && !loading && total > 0;
  const rangeStart = total ? currentPage * pageSize + 1 : 0;
  const rangeEnd = Math.min((currentPage + 1) * pageSize, total);

  /** CSS grid track template derived from column widths (+ selection column). */
  const templateColumns = useMemo(() => {
    const tracks = columns.map((c) => c.width ?? "minmax(0, 1fr)");
    if (selectable !== "none") {
      tracks.unshift("var(--ui-data-table-select-col-width)");
    }
    return tracks.join(" ");
  }, [columns, selectable]);

  /** Column count incl. the selection column, for aria-colcount. */
  const colCount = columns.length + (selectable !== "none" ? 1 : 0);
  /** Total grid rows incl. header, for aria-rowcount. */
  const ariaRowCount = rows.length + 1;

  /** Keys of every row in the current (sorted) dataset. */
  const allKeys = useMemo(
    () => sorted.map((r) => rowKeyOf(r)),
    [sorted, rowKeyOf],
  );
  const allSelected =
    allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelectedCount = allKeys.filter((k) => selected.has(k)).length;
  const someSelected = someSelectedCount > 0 && someSelectedCount < allKeys.length;

  // Reset roving focus to the first header cell when the row set or layout
  // changes (sort, page, mode, selection column) so indices never go stale.
  useEffect(() => {
    setActiveCell({ row: 0, col: 0 });
  }, [sorted, currentPage, mode, selectable]);

  const isActiveCell = (row: number, col: number): boolean =>
    activeCell.row === row && activeCell.col === col;

  const isSelected = (row: T): boolean => selected.has(rowKeyOf(row));

  const sortDirectionOf = (col: DataTableColumn<T>): SortDirection | null =>
    sort.find((s) => s.columnId === col.id)?.direction ?? null;

  const ariaSort = (
    col: DataTableColumn<T>,
  ): "ascending" | "descending" | "none" | undefined => {
    if (!col.sortable) return undefined;
    const dir = sortDirectionOf(col);
    return dir ? (dir === "asc" ? "ascending" : "descending") : "none";
  };

  const toggleSort = (
    col: DataTableColumn<T>,
    event: ReactMouseEvent,
  ): void => {
    if (!col.sortable) return;
    const additive = multiSort && event.shiftKey;
    const dir = sortDirectionOf(col);
    const next: SortState | null =
      dir === null
        ? { columnId: col.id, direction: "asc" }
        : dir === "asc"
          ? { columnId: col.id, direction: "desc" }
          : null;
    if (additive) {
      const without = sort.filter((s) => s.columnId !== col.id);
      setSort(next ? [...without, next] : without);
    } else {
      setSort(next ? [next] : []);
    }
  };

  const toggleRow = (row: T, checked: boolean): void => {
    const key = rowKeyOf(row);
    if (selectable === "single") {
      setSelected(checked ? new Set([key]) : new Set());
      return;
    }
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    setSelected(next);
  };

  const toggleAll = (checked: boolean): void => {
    setSelected(checked ? new Set(allKeys) : new Set());
  };

  const prevPage = (): void => setPageIndex(Math.max(0, currentPage - 1));
  const nextPage = (): void =>
    setPageIndex(Math.min(pageCount - 1, currentPage + 1));
  const changePageSize = (size: number): void => {
    setPageSize(size);
    setPageIndex(0);
  };

  const pageJump = (): number => (mode === "paginated" ? pageSize : 10);

  const focusCell = useCallback(
    (row: number, col: number): void => {
      const sel = `[data-row="${row}"][data-col="${col}"]`;
      const root = rootRef.current;
      const cell = root?.querySelector<HTMLElement>(sel);
      if (cell) {
        cell.focus();
        return;
      }
      // Virtual mode: bring the row into view, then focus (best-effort).
      const vp = viewportRef.current;
      if (vp && row > 0) {
        vp.scrollTop = (row - 1) * rowHeight;
        queueMicrotask(() => root?.querySelector<HTMLElement>(sel)?.focus());
      }
    },
    [rowHeight],
  );

  const activateCell = useCallback((): void => {
    const { row, col } = activeCell;
    const cell = rootRef.current?.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    cell
      ?.querySelector<HTMLElement>('button, input, a, [role="checkbox"]')
      ?.click();
    // Keep focus on the cell (roving tabindex) rather than the inner control.
    cell?.focus();
  }, [activeCell]);

  const onGridKeydown = (event: ReactKeyboardEvent): void => {
    const rowMax = visibleRows.length; // header = 0, data rows = 1..N
    const colMax = colCount - 1;
    let { row, col } = activeCell;
    switch (event.key) {
      case "ArrowRight":
        col = Math.min(colMax, col + 1);
        break;
      case "ArrowLeft":
        col = Math.max(0, col - 1);
        break;
      case "ArrowDown":
        row = Math.min(rowMax, row + 1);
        break;
      case "ArrowUp":
        row = Math.max(0, row - 1);
        break;
      case "Home":
        col = 0;
        if (event.ctrlKey) row = 0;
        break;
      case "End":
        col = colMax;
        if (event.ctrlKey) row = rowMax;
        break;
      case "PageDown":
        row = Math.min(rowMax, row + pageJump());
        break;
      case "PageUp":
        row = Math.max(0, row - pageJump());
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        activateCell();
        return;
      default:
        return;
    }
    event.preventDefault();
    setActiveCell({ row, col });
    focusCell(row, col);
  };

  /** Render the selection + data cells for one row. */
  const renderRowCells = (row: T, rowIndex: number): ReactNode => (
    <>
      {selectable !== "none" && (
        <div
          role="gridcell"
          className="ui-dt__td ui-dt__cell--select"
          data-row={rowIndex}
          data-col={0}
          tabIndex={isActiveCell(rowIndex, 0) ? 0 : -1}
        >
          <input
            type="checkbox"
            className="ui-dt__checkbox"
            aria-label="Select row"
            tabIndex={-1}
            checked={isSelected(row)}
            onChange={(e) => toggleRow(row, e.target.checked)}
          />
        </div>
      )}
      {columns.map((col, ci) => {
        const dataCol = selectable !== "none" ? ci + 1 : ci;
        const value = cellValue(col, row);
        return (
          <div
            key={col.id}
            role="gridcell"
            className={[
              "ui-dt__td",
              col.align === "center" ? "ui-dt__cell--center" : "",
              col.align === "end" ? "ui-dt__cell--end" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-row={rowIndex}
            data-col={dataCol}
            tabIndex={isActiveCell(rowIndex, dataCol) ? 0 : -1}
          >
            {col.cell ? col.cell(row, value) : (value as ReactNode)}
          </div>
        );
      })}
    </>
  );

  const hostClass = ["ui-data-table", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={hostClass} ref={rootRef}>
      <div
        className="ui-dt__grid"
        role="grid"
        aria-label={caption || undefined}
        aria-rowcount={ariaRowCount}
        aria-colcount={colCount}
        aria-busy={loading ? true : undefined}
        style={{
          maxHeight: maxHeight || undefined,
          overflowY: maxHeight ? "auto" : undefined,
        }}
        onKeyDown={onGridKeydown}
      >
        <div
          className="ui-dt__head"
          role="row"
          aria-rowindex={1}
          style={{ gridTemplateColumns: templateColumns }}
        >
          {selectable !== "none" && (
            <div
              role="columnheader"
              className="ui-dt__th ui-dt__cell--select"
              data-row={0}
              data-col={0}
              tabIndex={isActiveCell(0, 0) ? 0 : -1}
            >
              {selectable === "multiple" && (
                <input
                  type="checkbox"
                  className="ui-dt__checkbox"
                  aria-label="Select all rows"
                  tabIndex={-1}
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              )}
            </div>
          )}
          {columns.map((col, ci) => {
            const dataCol = selectable !== "none" ? ci + 1 : ci;
            return (
              <div
                key={col.id}
                role="columnheader"
                className={[
                  "ui-dt__th",
                  col.align === "center" ? "ui-dt__cell--center" : "",
                  col.align === "end" ? "ui-dt__cell--end" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-sort={ariaSort(col)}
                data-row={0}
                data-col={dataCol}
                tabIndex={isActiveCell(0, dataCol) ? 0 : -1}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="ui-dt__sort"
                    tabIndex={-1}
                    onClick={(e) => toggleSort(col, e)}
                  >
                    <span>{col.header}</span>
                    <span className="ui-dt__sort-icon" aria-hidden="true">
                      {sortDirectionOf(col) === "asc"
                        ? "↑"
                        : sortDirectionOf(col) === "desc"
                          ? "↓"
                          : "↕"}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </div>
            );
          })}
        </div>

        <div
          className="ui-dt__body"
          role={mode === "virtual" ? undefined : "rowgroup"}
        >
          {loading ? (
            <div className="ui-dt__status" role="status">
              Loading{"…"}
            </div>
          ) : !visibleRows.length ? (
            <div className="ui-dt__status">{emptyText}</div>
          ) : mode === "virtual" ? (
            <VirtualBody
              rows={visibleRows}
              rowHeight={rowHeight}
              viewportHeight={viewportHeight}
              viewportRef={viewportRef}
              rowKeyOf={rowKeyOf}
              templateColumns={templateColumns}
              selectable={selectable}
              isSelected={isSelected}
              renderRowCells={renderRowCells}
            />
          ) : (
            visibleRows.map((row, i) => (
              <div
                key={rowKeyOf(row)}
                role="row"
                className={[
                  "ui-dt__tr",
                  selectable !== "none" && isSelected(row)
                    ? "ui-dt__tr--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-rowindex={i + 2}
                aria-selected={
                  selectable !== "none" ? isSelected(row) : undefined
                }
                style={{ gridTemplateColumns: templateColumns }}
              >
                {renderRowCells(row, i + 1)}
              </div>
            ))
          )}
        </div>
      </div>

      {showFooter && (
        <div className="ui-dt__footer">
          <label className="ui-dt__page-size">
            <span>Rows per page</span>
            <select
              className="ui-dt__select"
              value={pageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <span className="ui-dt__range" aria-live="polite">
            {rangeStart}
            {"–"}
            {rangeEnd} of {total}
          </span>

          <div className="ui-dt__pager">
            <button
              type="button"
              className="ui-dt__page-btn"
              aria-label="Previous page"
              disabled={currentPage === 0}
              onClick={prevPage}
            >
              {"‹"}
            </button>
            <span className="ui-dt__page-status">
              Page {currentPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              className="ui-dt__page-btn"
              aria-label="Next page"
              disabled={currentPage >= pageCount - 1}
              onClick={nextPage}
            >
              {"›"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface VirtualBodyProps<T> {
  rows: T[];
  rowHeight: number;
  viewportHeight: string;
  viewportRef: RefObject<HTMLDivElement | null>;
  rowKeyOf: (row: T) => RowKey;
  templateColumns: string;
  selectable: SelectionMode;
  isSelected: (row: T) => boolean;
  renderRowCells: (row: T, rowIndex: number) => ReactNode;
}

/** Simple windowed virtual scroll body (no external dependency). */
function VirtualBody<T>({
  rows,
  rowHeight,
  viewportHeight,
  viewportRef,
  rowKeyOf,
  templateColumns,
  selectable,
  isSelected,
  renderRowCells,
}: VirtualBodyProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (el) setClientHeight(el.clientHeight);
  }, [viewportRef, viewportHeight]);

  const overscan = 4;
  const viewport = clientHeight || parseInt(viewportHeight, 10) || 400;
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(viewport / rowHeight) + overscan * 2;
  const last = Math.min(rows.length, first + visibleCount);
  const slice = rows.slice(first, last);

  return (
    <div
      className="ui-dt__viewport"
      role="rowgroup"
      ref={viewportRef}
      style={{ height: viewportHeight, overflowY: "auto" }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: rows.length * rowHeight, position: "relative" }}>
        {slice.map((row, idx) => {
          const i = first + idx;
          return (
            <div
              key={rowKeyOf(row)}
              role="row"
              className={[
                "ui-dt__tr",
                selectable !== "none" && isSelected(row)
                  ? "ui-dt__tr--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-rowindex={i + 2}
              aria-selected={
                selectable !== "none" ? isSelected(row) : undefined
              }
              style={{
                position: "absolute",
                top: i * rowHeight,
                left: 0,
                right: 0,
                height: rowHeight,
                gridTemplateColumns: templateColumns,
              }}
            >
              {renderRowCells(row, i + 1)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
