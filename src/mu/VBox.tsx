import React from 'react';
import { FlexBox, HVBoxProps } from './FlexBox';

/**
 * VBox component
 * @param props Props
 * @returns VBox
 */
export function VBox(props: HVBoxProps) {
    const { itemPadding, ...rest } = props;
    return (
        <FlexBox
            flexDirection="column"
            itemStyle={{ marginTop: itemPadding }}
            {...rest}
        />
    );
}
