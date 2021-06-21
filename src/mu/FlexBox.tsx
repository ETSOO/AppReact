import { Stack, StackProps } from '@material-ui/core';
import React from 'react';

/**
 * Horizonal box
 * @param props Props
 * @returns Component
 */
export function HBox(props: StackProps) {
    return <Stack direction="row" width="100%" {...props} />;
}

/**
 * Vertial box
 * @param props Props
 * @returns Component
 */
export function VBox(props: StackProps) {
    return <Stack direction="column" {...props} />;
}
