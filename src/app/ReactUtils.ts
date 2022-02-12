import { createHistory, History, HistorySource, navigate } from '@reach/router';
import React from 'react';

type MemoryHistorySource = HistorySource & {
    history: {
        get entries(): any;
        get index(): number;
        go(to: number): void;
    };
};

/**
 * React utils
 */
export namespace ReactUtils {
    // Memory history
    // https://github.com/reach/router/issues/225
    let memoryHistory: History | null;

    /**
     * Cretae memory source to fix go back bug
     * @param initialPath Initial path
     */
    export function createMemorySource(
        initialPath: string = '/'
    ): MemoryHistorySource {
        const searchIndex = initialPath.indexOf('?');
        const pathname =
            searchIndex > -1
                ? initialPath.substring(0, searchIndex)
                : initialPath;

        const initialLocation: any = {
            pathname,
            search: searchIndex > -1 ? initialPath.substring(searchIndex) : ''
        };

        let index = 0;

        const stack = [initialLocation];
        const states = [null];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ''] = uri.split('?');
                    index++;

                    // View a, index = 0
                    // View b, index = 1
                    // Go(-1), a, index = 0
                    // View c, index = 1, directly push is wrong
                    if (index < stack.length) {
                        stack.splice(index, stack.length - index);
                        states.splice(index, stack.length - index);
                    }

                    stack.push({
                        pathname,
                        search: search.length ? `?${search}` : search
                    });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ''] = uri.split('?');
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
                go(to: number) {
                    const newIndex = index + to;

                    if (newIndex < 0 || newIndex > states.length - 1) {
                        return;
                    }

                    index = newIndex;
                }
            }
        };
    }

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
     * @param initialPath Initial path
     * @returns History
     */
    export function getMemoryHistory(initialPath?: string | null) {
        if (memoryHistory == null) {
            memoryHistory = createHistory(
                createMemorySource(initialPath ?? '/')
            );
        }
        return memoryHistory;
    }

    /**
     * Get navigate function, works with memory history
     * @returns NavigateFn
     */
    export function getNavigateFn() {
        if (memoryHistory == null) return navigate;
        return memoryHistory.navigate;
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
