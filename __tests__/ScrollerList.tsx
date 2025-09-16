import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { screen, waitFor } from "@testing-library/react";
import { List } from "react-window";
import { ScrollerList } from "../src";

// List item
type ListItem = {
  id: string;
  name: string;
};

const items: ListItem[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
  { id: "3", name: "Item 3" },
  { id: "4", name: "Item 4" },
  { id: "5", name: "Item 5" }
];

// Root
const root = document.body;
const container: HTMLElement = document.createElement("div");
root.append(container);

const reactRoot = createRoot(container);

test("Tests for original List", async () => {
  act(() => {
    reactRoot.render(
      <List<{ items: ListItem[] }>
        className="test"
        defaultHeight={200}
        onRowsRendered={({ startIndex, stopIndex }) => {
          expect(startIndex).toBe(0);
          expect(stopIndex).toBe(3);
        }}
        rowComponent={({ index, style, items }) => (
          <h1 id={`id${index}`} style={style}>
            {items[index].id} / {items[index].name}
          </h1>
        )}
        rowCount={items.length}
        rowHeight={50}
        rowProps={{ items }}
      />
    );
  });

  const element = await screen.findByText("4 / Item 4");
  expect(element.id).toBe("id3");
});

test("Tests for custom List", async () => {
  act(() => {
    reactRoot.render(
      <ScrollerList<ListItem>
        defaultHeight={200}
        loadData={(props, lastItem) => {
          expect(props.queryPaging.currentPage).toBe(0);
          expect(props.queryPaging.batchSize).toBe(10);

          return new Promise((resolve) => resolve(items));
        }}
        onRowsRendered={({ startIndex, stopIndex }) => {
          expect(startIndex).toBe(0);
          expect(stopIndex).toBe(3);
        }}
        rowHeight={50}
        rowComponent={({ index, style, items }) => {
          return (
            <h1 id={`id${index}`} style={style}>
              {items[index].id} / {items[index].name}
            </h1>
          );
        }}
      />
    );
  });

  await waitFor(() => {
    const item = screen.getByText("3 / Item 3");
    expect(item.id).toBe("id2");
  });
});
