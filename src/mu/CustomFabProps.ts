/**
 * Custom fab size
 */
export type CustomFabSize = 'small' | 'medium' | 'large';

/**
 * Custom fab props
 */
export interface CustomFabProps {
    /**
     * Fab size
     */
    size?: CustomFabSize;

    /**
     * Fab title
     */
    title?: string;
}
