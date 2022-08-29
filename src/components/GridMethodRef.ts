import { GridLoaderStates } from './GridLoader';

/**
 * Grid method ref
 */
export interface GridMethodRef<T> {
    /**
     * Reset
     * @param add Additional data
     */
    reset(add?: Partial<GridLoaderStates<T>>): void;
}
