import { DataTypes } from '@etsoo/shared';
import React from 'react';

/**
 * Create multiple refs
 * @param fields Fields
 * @returns Result
 */
export function useRefs<F extends ReadonlyArray<string>, T = HTMLInputElement>(
    fields: F
): DataTypes.DI<F, React.MutableRefObject<T | undefined>> {
    const refs: Record<string, React.MutableRefObject<T | undefined>> = {};
    fields.forEach((field) => (refs[field] = React.useRef<T>()));
    return refs as any;
}
