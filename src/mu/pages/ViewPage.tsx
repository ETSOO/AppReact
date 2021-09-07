import React from 'react';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

/**
 * View page props
 */
export interface ViewPageProps extends CommonPageProps {}

/**
 * View page
 * @param props Props
 */
export function ViewPage(props: ViewPageProps) {
    // Destruct
    const { ...rest } = props;

    return <CommonPage {...rest} scrollContainer={global}></CommonPage>;
}
