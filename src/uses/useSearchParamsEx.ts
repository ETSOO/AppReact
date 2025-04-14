import { DataTypes, DomUtils } from "@etsoo/shared";
import { useSearchParams } from "react-router";

function parseData<T extends DataTypes.BasicTemplate>(
  template: T,
  sp: URLSearchParams
) {
  const paras = Object.fromEntries(
    Object.keys(template).map((key) => {
      const type = template[key];
      return [key, type.endsWith("[]") ? sp.getAll(key) : sp.get(key)];
    })
  );

  // Return
  return DomUtils.dataAs(paras, template, false);
}

/**
 * Extended useSearchParams of react-router-dom
 * Provide exact type data
 */
export function useSearchParamsEx<T extends DataTypes.BasicTemplate>(
  template: T
) {
  // Get parameters
  const [sp] = useSearchParams();
  return parseData(template, sp);
}

/**
 * Extended useSearchParams of react-router-dom
 * Provide exact type data and setSearchParams function
 */
export function useSearchParamsEx1<T extends DataTypes.BasicTemplate>(
  template: T
) {
  // Get parameters
  const [sp, setSearchParams] = useSearchParams();

  // Return
  return [parseData(template, sp), setSearchParams] as const;
}
