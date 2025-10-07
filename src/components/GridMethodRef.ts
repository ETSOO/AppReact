import { ListImperativeAPI } from "react-window";
import { GridLoaderPartialStates } from "./GridLoader";

/**
 * Scroll to row parameter type
 */
export type ScrollToRowParam = Parameters<ListImperativeAPI["scrollToRow"]>[0];

/**
 * Grid method ref
 */
export interface GridMethodRef<T> {
  /**
   * Get the element
   * @returns Element
   */
  get element(): HTMLElement | null | undefined;

  /**
   * Delete item at the index
   * @param index Index
   */
  delete(index: number): T | undefined;

  /**
   * Insert the item at start
   * @param item Item
   * @param start Start position
   */
  insert(item: T, start: number): void;

  /**
   * Refresh latest page data
   */
  refresh(): void;

  /**
   * Reset
   * @param add Additional data
   */
  reset(add?: GridLoaderPartialStates<T>): void;

  /**
   * Scroll to the row
   * @param param Parameters to control
   */
  scrollToRow(param: ScrollToRowParam): void;
}
