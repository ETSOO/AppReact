import { Utils } from '@etsoo/shared';
import React from 'react';
import { SearchBar } from '../SearchBar';
import { CommonPage, CommonPageProps } from './CommonPage';
//import { DataGrid, DataGridProps } from '@material-ui/data-grid';

/**
 * Search page props
 */
export interface SearchPageProps<T> extends CommonPageProps {
    /**
     * Fields
     */
    fields: React.ReactElement[];

    /**
     * Load data callback
     */
    loadData: (page: number) => T[] | PromiseLike<T[]>;
}

/**
 * Search page
 * @param props Props
 */
export function SearchPage<T>(props: SearchPageProps<T>) {
    // Destruct
    const { fields, loadData, ...rest } = props;

    // On submit callback
    const onSubmit = (data: FormData, reset: boolean) => {
        console.log(reset, Utils.formDataToObject(Utils.clearFormData(data)));
    };

    // Layout
    return (
        <CommonPage {...rest}>
            <SearchBar fields={fields} onSubmit={onSubmit} />
        </CommonPage>
    );
}
