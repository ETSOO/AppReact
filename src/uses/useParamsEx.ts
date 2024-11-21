import { DataTypes, DomUtils } from "@etsoo/shared";
import { useParams } from "react-router-dom";

/**
 * Extended useParams of react-router-dom
 * Provide exact type data
 */
export function useParamsEx<T extends DataTypes.BasicTemplate>(template: T) {
  // Get parameters
  const params = useParams<{ [K in keyof T]: string }>();

  // Return
  return DomUtils.dataAs(params, template, false);
}
