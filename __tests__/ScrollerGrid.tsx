import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { screen, waitFor } from "@testing-library/react";
import { Grid } from "react-window";
import { GridColumn, ScrollerGrid } from "../src";

// List item
type ListItem = {
  id: string;
  name: string;
};

const rows: ListItem[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
  { id: "3", name: "Item 3" },
  { id: "4", name: "Item 4" },
  { id: "5", name: "Item 5" }
];

const columns: GridColumn<ListItem>[] = [
  { field: "id", header: "ID", width: 100 },
  { field: "name", header: "Name", width: 200 }
];

const columnCount = columns.length;
const columnWidth = (index: number, cellProps: { rows: ListItem[] }) => {
  return columns[index].width ?? 0;
};

// Root
const root = document.body;
const container: HTMLElement = document.createElement("div");
root.append(container);

const reactRoot = createRoot(container);

test("Tests for original Grid", async () => {
  act(() => {
    reactRoot.render(
      <Grid<{ rows: ListItem[] }>
        className="test"
        defaultHeight={200}
        onCellsRendered={(visibleCells, allCells) => {
          expect(visibleCells.rowStartIndex).toBe(0);
          expect(visibleCells.rowStopIndex).toBe(3);
        }}
        cellComponent={({ columnIndex, rowIndex, style, rows }) => (
          <h1 id={`id${rowIndex}`} style={style}>
            {rows[rowIndex][columns[columnIndex].field ?? "id"]}
          </h1>
        )}
        rowCount={rows.length}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowHeight={50}
        cellProps={{ rows }}
      />
    );
  });

  const element = await screen.findByText("Item 4");
  expect(element.id).toBe("id3");
});

test("Tests for custom Grid", async () => {
  act(() => {
    reactRoot.render(
      <ScrollerGrid<ListItem>
        loadData={(props, lastItem) => {
          expect(props.queryPaging.currentPage).toBe(0);
          expect(props.queryPaging.batchSize).toBe(10);

          return new Promise((resolve) => resolve(rows));
        }}
        columnCount={columnCount}
        columnWidth={columnWidth}
        defaultHeight={200}
        rowHeight={50}
        cellComponent={({ columnIndex, rowIndex, style, rows }) => {
          return (
            <h1 id={`id${rowIndex}`} style={style}>
              {rows[rowIndex][columns[columnIndex].field ?? "id"]}
            </h1>
          );
        }}
      />
    );
  });

  await waitFor(() => {
    const item = screen.getByText("Item 3");
    expect(item.id).toBe("id2");
  });
});
