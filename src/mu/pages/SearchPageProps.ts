import { GridJsonData, GridLoader } from '../../components/GridLoader';
import { CommonPageProps } from './CommonPageProps';

/**
 * Search page props
 */
export interface SearchPageProps<T, F extends {}>
    extends Omit<GridLoader<T>, 'loadData'> {
    /**
     * Search fields
     */
    fields: React.ReactElement[];

    /**
     * Search field template
     */
    fieldTemplate?: F;

    /**
     * Load data callback
     */
    loadData: (
        data: GridJsonData & Partial<F>
    ) => PromiseLike<T[] | null | undefined>;

    /**
     * Page props
     */
    pageProps?: CommonPageProps;

    /**
     * Size ready to read miliseconds span
     * @default 100
     */
    sizeReadyMiliseconds?: number;
}
