import { GridLoaderStates } from '../components/GridLoader';

/**
 * Grid method ref
 */
export interface GridMethodRef {
    /**
     * Reset
     * @param add Additional data
     */
    reset(add?: Partial<GridLoaderStates<unknown>>): void;
}
