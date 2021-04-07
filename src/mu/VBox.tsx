import React from 'react';
import { FlexBox, FlexBoxProps } from './FlexBox';

/**
 * VBox props
 */
export type VBoxProps = Exclude<FlexBoxProps, 'flexDirection'>;

/**
 * VBox component
 * @param props Props
 * @returns VBox
 */
export function VBox(props: VBoxProps) {
    return <FlexBox flexDirection="column" {...props} />;
}
