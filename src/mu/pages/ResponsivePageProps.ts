import { DataTypes } from '@etsoo/shared';
import { ListChildComponentProps } from 'react-window';
import { GridMethodRef } from '../GridMethodRef';
import { ScrollerListExInnerItemRendererProps } from '../ScrollerListEx';
import { DataGridPageProps } from './DataGridPageProps';

/**
 * Response page props
 */
export interface ResponsePageProps<T, F extends DataTypes.BasicTemplate>
    extends Omit<
        DataGridPageProps<T, F>,
        'mRef' | 'itemKey' | 'onScroll' | 'onItemsRendered'
    > {
    /**
     * Min width to show Datagrid
     */
    dataGridMinWidth?: number;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Item renderer
     */
    itemRenderer?: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ((index: number) => number) | number;

    /**
     * Methods
     */
    mRef?: React.MutableRefObject<GridMethodRef | undefined>;

    /**
     * Pull to refresh data
     */
    pullToRefresh?: boolean;
}
