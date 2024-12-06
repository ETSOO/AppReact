import { DataTypes } from "@etsoo/shared";
import {
  GridDataGetData,
  GridTemplateType
} from "../src/components/GridLoader";

const template = {
  keyword: "string",
  deviceId: "number",
  creationStart: "date",
  creationEnd: "date"
} as const satisfies DataTypes.BasicTemplate;

test("Tests for GridTemplateType", () => {
  const data: GridTemplateType<typeof template> = {
    keyword: "test",
    deviceId: 1,
    creationStart: new Date()
  };

  expect(data.keyword).toBe("test");
  expect(data.deviceId).toBe(1);
});

test("Tests for GridDataGetData with keeping source", () => {
  const data = {
    keyword: "test",
    deviceId: 1,
    creationStart: "2024/12/06",
    other: false
  };

  const result = GridDataGetData(data, template, true);

  expect(result.keyword).toBe("test");
  expect(result.deviceId).toBe(1);
  expect(result.creationStart).toBeInstanceOf(Date);
  expect((result as any).other).toBe(false);
});

test("Tests for GridDataGetData without keeping source", () => {
  const data = {
    keyword: "test",
    deviceId: 1,
    creationStart: "2024/12/06",
    other: false
  };

  const result = GridDataGetData(data, template, false);

  expect(result.keyword).toBe("test");
  expect(result.deviceId).toBe(1);
  expect(result.creationStart).toBeInstanceOf(Date);
  expect((result as any).other).toBeUndefined();
});
