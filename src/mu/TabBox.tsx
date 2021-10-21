import { Box, BoxProps, Tab, TabProps, Tabs, TabsProps } from '@mui/material';
import React from 'react';

/**
 * Tab with box panel props
 */
export interface TabBoxPanel extends Omit<TabProps, 'value' | 'children'> {
    /**
     * Children
     */
    children?: React.ReactNode;

    /**
     * Panel box props
     */
    panel?: Omit<BoxProps, 'hidden'>;
}

/**
 * Tabs with box props
 */
export interface TabBoxPros extends BoxProps {
    /**
     * Root props
     */
    root?: BoxProps;

    /**
     * Container props
     */
    container?: Omit<TabsProps, 'value'>;

    /**
     * Tabs
     */
    tabs: TabBoxPanel[];
}

/**
 * Tabs with box
 * @param props Props
 * @returns Component
 */
export function TabBox(props: TabBoxPros) {
    // Destruct
    const { root, container = {}, tabs } = props;
    const { onChange, ...rest } = container;

    // State
    const [value, setValue] = React.useState(0);

    // Layout
    return (
        <React.Fragment>
            <Box {...root}>
                <Tabs
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        if (onChange) onChange(event, newValue);
                    }}
                    {...rest}
                >
                    {tabs.map(({ children, panel, ...tabRest }, index) => (
                        <Tab value={index} {...tabRest} />
                    ))}
                </Tabs>
            </Box>
            {tabs.map(({ children, panel }, index) => (
                <Box hidden={value !== index} {...panel}>
                    {children}
                </Box>
            ))}
        </React.Fragment>
    );
}
