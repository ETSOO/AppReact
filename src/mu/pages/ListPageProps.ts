import { ScrollerListExProps } from '../ScrollerListEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * List page props
 */
export interface ListPageProps<T, F extends {}>
    extends SearchPageProps<T, F>,
        Omit<ScrollerListExProps<T>, 'loadData'> {}
