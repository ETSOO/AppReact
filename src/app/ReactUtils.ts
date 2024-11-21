import { DataTypes, DateUtils, DomUtils, Utils } from "@etsoo/shared";
import React from "react";

/**
 * React utils
 */
export namespace ReactUtils {
  /**
   * Format input value
   * @param value Input value
   * @returns Formatted value
   */
  export function formatInputValue(value: unknown) {
    if (value === null) return undefined;

    if (typeof value === "number") return value;

    if (typeof value === "string") return value;

    if (Array.isArray(value)) return value;

    return String(value);
  }

  /**
   * Is safe click
   * @param event Mouse event
   * @returns Result
   */
  export function isSafeClick(event: React.MouseEvent<HTMLElement>) {
    // No target
    // HTMLElement <= Element, SVGElement <= Element
    if (!(event.target instanceof Element)) return true;

    // Outside of the currentTarget
    let target: Element | null = event.target;
    if (!event.currentTarget.contains(target)) return false;

    while (target != null && target != event.currentTarget) {
      const nodeName = target.nodeName.toUpperCase();
      if (
        nodeName === "INPUT" ||
        nodeName === "BUTTON" ||
        nodeName === "A" ||
        target.hasAttribute("onClick")
      )
        return false;

      target = target.parentElement;
    }

    return true;
  }

  /**
   * Trigger input change event
   * @param input Form input
   * @param value New value
   * @param cancelable Cancelable
   */
  export function triggerChange(
    input: HTMLInputElement,
    value: string,
    cancelable: boolean = false
  ) {
    // Radio type not supported
    if (input.type === "radio") return;

    // checked?
    const checked = input.type === "checkbox";

    // Property name
    const property = checked ? "checked" : "value";

    // input.value = newValue will not trigger the change event
    // input type = 'hidden' will also not trigger the event
    // https://coryrylan.com/blog/trigger-input-updates-with-react-controlled-inputs
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      property
    )?.set;

    if (checked) {
      const checkedValue = input.value == value;
      nativeInputValueSetter?.call(input, checkedValue);

      const clickEvent = new Event("click", {
        bubbles: true,
        cancelable
      });
      input.dispatchEvent(clickEvent);
    } else {
      nativeInputValueSetter?.call(input, value);

      const inputEvent = new Event("change", {
        bubbles: true,
        cancelable
      });
      input.dispatchEvent(inputEvent);
    }
  }

  /**
   * Update refs
   * @param refs Refs
   * @param data Data
   * @param callback Callback to update refs' value, return false continue to process
   */
  export function updateRefs<D extends object, T = HTMLInputElement>(
    refs: Partial<
      DataTypes.DI<
        ReadonlyArray<keyof D & string>,
        React.MutableRefObject<T | null>
      >
    >,
    data: D,
    callback?:
      | ((item: T, value: D[keyof D & string]) => void | boolean)
      | keyof T
  ) {
    const local: typeof callback =
      callback == null
        ? undefined
        : typeof callback === "function"
        ? callback
        : (item, value) => {
            item[callback] = value as any;
          };

    let k: keyof typeof refs;
    for (k in refs) {
      const ref = refs[k];
      const item = ref?.current;
      if (item == null) continue;

      if (local && local(item, data[k]) !== false) {
        continue;
      } else if (
        item instanceof HTMLInputElement ||
        item instanceof HTMLTextAreaElement ||
        item instanceof HTMLSelectElement
      ) {
        const value = Utils.getNestedValue(data, item.name || k);

        const isDateTime = item.type === "datetime-local";
        if (isDateTime || item.type === "date") {
          item.value =
            DateUtils.formatForInput(value, isDateTime ? false : undefined) ??
            "";
        } else {
          item.value = `${value ?? ""}`;
        }
      } else {
        (item as any).value = data[k];
      }
    }
  }

  /**
   * Update data with refs
   * @param refs Refs
   * @param data Data
   * @param callback Callback to return new value
   * @param ignoreEmpty Ignore empty string or not, default true
   */
  export function updateRefValues<D extends object, T = HTMLInputElement>(
    refs: Partial<
      DataTypes.DI<
        ReadonlyArray<keyof D & string>,
        React.MutableRefObject<T | null>
      >
    >,
    data: D,
    callback?: ((item: T) => any) | keyof T,
    ignoreEmpty: boolean = true
  ) {
    const local: typeof callback =
      callback == null
        ? undefined
        : typeof callback === "function"
        ? callback
        : (item) => item[callback];

    const formatValue = (value: unknown) => {
      if (ignoreEmpty && value === "") return null;
      return value;
    };

    let k: keyof typeof refs;
    for (k in refs) {
      const ref = refs[k];
      const item = ref?.current;
      if (item == null) continue;

      if (local) {
        data[k] = local(item);
      } else if (item instanceof HTMLInputElement) {
        Utils.setNestedValue(
          data,
          item.name || k,
          formatValue(DomUtils.getInputValue(item)),
          true
        );
      } else if (
        item instanceof HTMLTextAreaElement ||
        item instanceof HTMLSelectElement
      ) {
        Utils.setNestedValue(
          data,
          item.name || k,
          formatValue(item.value),
          true
        );
      } else {
        data[k] = (item as any).value;
      }
    }
  }
}
