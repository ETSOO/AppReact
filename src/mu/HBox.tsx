import React from 'react';
import { FlexBox, FlexBoxProps } from './FlexBox';

/**
 * HBox props
 */
export type HBoxProps = Exclude<FlexBoxProps, 'flexDirection'>;

/**
 * HBox component
 * @param props Props
 * @returns HBox
 */
export function HBox(props: HBoxProps) {
    return <FlexBox flexDirection="row" {...props} />;
}
