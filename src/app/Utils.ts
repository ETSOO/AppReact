import { createHistory, createMemorySource, History } from '@reach/router';
import React from 'react';

/**
 * React utils
 */
export namespace Utils {
    // Memory history
    // https://github.com/reach/router/issues/225
    let memoryHistory: History | null;

    /**
     * Format input value
     * @param value Input value
     * @returns Formatted value
     */
    export function formatInputValue(value: unknown) {
        if (value === null) return undefined;

        if (typeof value === 'number') return value;

        if (typeof value === 'string') return value;

        if (Array.isArray(value)) return value;

        return String(value);
    }

    /**
     * Get memory history
     * @returns History
     */
    export function getMemoryHistory() {
        if (memoryHistory == null) {
            memoryHistory = createHistory(createMemorySource('/'));
        }
        return memoryHistory;
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
                nodeName === 'INPUT' ||
                nodeName === 'BUTTON' ||
                nodeName === 'A' ||
                target.hasAttribute('onClick')
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
        cancelable: boolean
    ) {
        // Radio type not supported
        if (input.type === 'radio') return;

        // checked?
        const checked = input.type === 'checkbox';

        // Property name
        const property = checked ? 'checked' : 'value';

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

            const clickEvent = new Event('click', {
                bubbles: true,
                cancelable
            });
            input.dispatchEvent(clickEvent);
        } else {
            nativeInputValueSetter?.call(input, value);

            const inputEvent = new Event('change', {
                bubbles: true,
                cancelable
            });
            input.dispatchEvent(inputEvent);
        }
    }
}
