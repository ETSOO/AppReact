import { DataTypes } from '@etsoo/shared';
import { GridJsonData, GridLoader } from '../../components/GridLoader';
import { CommonPageProps } from './CommonPageProps';

/**
 * Search page props
 */
export interface SearchPageProps<T, F extends DataTypes.BasicTemplate>
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
        data: GridJsonData & DataTypes.BasicTemplateType<F>
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
