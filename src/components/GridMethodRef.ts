import { Align } from "react-window";
import { GridLoaderPartialStates } from "./GridLoader";

/**
 * Grid method ref
 */
export interface GridMethodRef<T> {
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
   * Reset
   * @param add Additional data
   */
  reset(add?: GridLoaderPartialStates<T>): void;

  /**
   * Scroll to the specified offset (scrollTop or scrollLeft, depending on the direction prop).
   */
  scrollToRef(scrollOffset: number): void;

  /**
   * Scroll to the specified item.
   */
  scrollToItemRef(index: number, align?: Align): void;
}
