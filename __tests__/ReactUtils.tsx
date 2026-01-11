import React from "react";
import { useRefs } from "../src";
import { ReactUtils } from "../src/app/ReactUtils";
import { render, renderHook } from "@testing-library/react";

test("Tests for ReactUtils.formatInputValue", () => {
  expect(ReactUtils.formatInputValue([1, "a"])).toEqual([1, "a"]);
  expect(ReactUtils.formatInputValue(true)).toEqual("true");
});

test("Tests for ReactUtils.updateRefValues", () => {
  // Input refs
  const refFields = ["name", "retailPrice", "qty"] as const;

  // Hook
  const { result: refs } = renderHook(() => useRefs(refFields));

  // Act
  render(
    <div>
      <input name="name" ref={refs.current.name} />
      <input
        name="price.retailPrice"
        type="number"
        ref={refs.current.retailPrice}
      />
      <input name="qty" type="number" ref={refs.current.qty} />
    </div>
  );

  const data = {
    name: "Test",
    price: { retailPrice: 300.5 },
    qty: 2
  };

  ReactUtils.updateRefs(refs.current, data);

  expect(refs.current.name.current?.value).toBe(data.name);
  expect(refs.current.retailPrice.current?.value).toBe(
    data.price.retailPrice.toString()
  );
  expect(refs.current.qty.current?.value).toBe(data.qty.toString());

  const newData: Partial<typeof data> = {};
  ReactUtils.updateRefValues(refs.current, newData);

  expect(newData.name).toBe(data.name);
  expect(newData.price?.retailPrice).toBe(data.price.retailPrice);
  expect(newData.qty).toBe(data.qty);
});
