import React from 'react';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

/**
 * Edit page props
 */
export interface EditPageProps extends CommonPageProps {}

/**
 * Edit page
 * @param props Props
 */
export function EditPage(props: EditPageProps) {
    // Destruct
    const { ...rest } = props;

    return <CommonPage {...rest}></CommonPage>;
}
