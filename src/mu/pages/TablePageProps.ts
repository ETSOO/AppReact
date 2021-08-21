import { TableExProps } from '../TableEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * Table page props
 */
export interface TablePageProps<T>
    extends SearchPageProps<T>,
        Omit<TableExProps<T>, 'loadData'> {}
