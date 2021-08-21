import { DataGridExProps } from '../DataGridEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * DataGrid page props
 */
export interface DataGridPageProps<T>
    extends SearchPageProps<T>,
        Omit<DataGridExProps<T>, 'loadData' | 'height'> {
    /**
     * Height will be deducted
     * @param height Current calcuated height
     */
    adjustHeight?: (height: number) => number;

    /**
     * Grid height
     */
    height?: number;
}
