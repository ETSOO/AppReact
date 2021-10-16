import { DataTypes } from '@etsoo/shared';
import { ScrollerListExProps } from '../ScrollerListEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * List page props
 */
export interface ListPageProps<T, F extends DataTypes.BasicTemplate>
    extends SearchPageProps<T, F>,
        Omit<ScrollerListExProps<T>, 'loadData'> {}
