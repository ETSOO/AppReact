import { DataTypes } from '@etsoo/shared';
import { TableExProps } from '../TableEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * Table page props
 */
export type TablePageProps<
    T extends object,
    F extends DataTypes.BasicTemplate
> = SearchPageProps<T, F> & Omit<TableExProps<T>, 'loadData'>;
