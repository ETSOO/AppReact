import React from 'react';
import { FlexBox, HVBoxProps } from './FlexBox';

/**
 * HBox component
 * @param props Props
 * @returns HBox
 */
export function HBox(props: HVBoxProps) {
    const { itemPadding, ...rest } = props;
    return (
        <FlexBox
            flexDirection="row"
            width="100%"
            itemStyle={{ marginLeft: itemPadding }}
            {...rest}
        />
    );
}
