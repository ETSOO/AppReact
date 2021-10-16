import { DataTypes } from '@etsoo/shared';
import { TableExProps } from '../TableEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * Table page props
 */
export interface TablePageProps<T, F extends DataTypes.BasicTemplate>
    extends SearchPageProps<T, F>,
        Omit<TableExProps<T>, 'loadData'> {}
