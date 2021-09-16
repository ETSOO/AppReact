import { GridJsonData, GridLoader } from '../../components/GridLoader';
import { CommonPageProps } from './CommonPageProps';

/**
 * Search page props
 */
export interface SearchPageProps<T> extends Omit<GridLoader<T>, 'loadData'> {
    /**
     * Fields
     */
    fields: React.ReactElement[];

    /**
     * Load data callback
     */
    loadData: (data: GridJsonData) => PromiseLike<T[] | null | undefined>;

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
