import { useState } from "react";
import { DataTable, type DataTableColumn, type RowKey } from "./DataTable";
import type { Demo } from "../button/button.demos";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROWS: Person[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@onyx.dev", role: "Lead" },
  { id: 2, name: "Grace Hopper", email: "grace@onyx.dev", role: "Engineer" },
  { id: 3, name: "Alan Turing", email: "alan@onyx.dev", role: "Engineer" },
];

const BASIC_COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "email", header: "Email", field: "email", sortable: true },
  { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
];

const PAGED_COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name", sortable: true },
  { id: "email", header: "Email", field: "email" },
  { id: "role", header: "Role", field: "role", sortable: true, align: "end" },
];

const PLAIN_COLUMNS: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", field: "name" },
  { id: "email", header: "Email", field: "email" },
  { id: "role", header: "Role", field: "role", align: "end" },
];

const MANY: Person[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  email: `member${i + 1}@onyx.dev`,
  role: i % 2 ? "Engineer" : "Lead",
}));

const HUGE: Person[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `Member ${i + 1}`,
  email: `member${i + 1}@onyx.dev`,
  role: i % 2 ? "Engineer" : "Lead",
}));

function SelectionDemo() {
  const [selected, setSelected] = useState<Set<RowKey>>(new Set());
  return (
    <DataTable
      caption="Team members"
      rowKey="id"
      columns={PLAIN_COLUMNS}
      rows={ROWS}
      selectable="multiple"
      selected={selected}
      onSelectedChange={setSelected}
    />
  );
}

export const dataTableDemos: Demo[] = [
  {
    title: "Basic",
    description: "Shift+click headers for multi-column sort.",
    render: () => (
      <DataTable
        caption="Team members"
        rowKey="id"
        columns={BASIC_COLUMNS}
        rows={ROWS}
        multiSort
      />
    ),
  },
  {
    title: "Pagination",
    render: () => (
      <DataTable
        caption="Catalogue"
        rowKey="id"
        columns={PAGED_COLUMNS}
        rows={MANY}
        pageSize={6}
        pageSizeOptions={[6, 12, 24]}
      />
    ),
  },
  {
    title: "Virtual scroll",
    description: "10 000 rows, windowed with no extra dependency.",
    render: () => (
      <DataTable
        caption="10 000 rows"
        rowKey="id"
        columns={PLAIN_COLUMNS}
        rows={HUGE}
        mode="virtual"
        rowHeight={40}
        viewportHeight="320px"
      />
    ),
  },
  {
    title: "Selection",
    render: () => <SelectionDemo />,
  },
  {
    title: "Empty state",
    render: () => (
      <DataTable
        caption="Team"
        columns={PLAIN_COLUMNS}
        rows={[]}
        emptyText="No members yet"
      />
    ),
  },
  {
    title: "Loading",
    render: () => (
      <DataTable caption="Team" columns={PLAIN_COLUMNS} rows={[]} loading />
    ),
  },
];
