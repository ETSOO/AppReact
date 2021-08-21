import { ScrollerListExProps } from '../ScrollerListEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * List page props
 */
export interface ListPageProps<T>
    extends SearchPageProps<T>,
        Omit<ScrollerListExProps<T>, 'loadData'> {}
