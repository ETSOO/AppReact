import { Utils } from '@etsoo/shared';
import { Box, BoxProps, Tab, TabProps, Tabs, TabsProps } from '@mui/material';
import React from 'react';

/**
 * Tab with box panel props
 */
export interface TabBoxPanel extends Omit<TabProps, 'value' | 'children'> {
    /**
     * Children
     */
    children?: ((visible: boolean) => React.ReactNode) | React.ReactNode;

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
     * Container props
     */
    container?: Omit<TabsProps, 'value'>;

    /**
     * Add a hidden input and its name
     */
    inputName?: string;

    /**
     * Root props
     */
    root?: BoxProps;

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
    const { inputName, root, container = {}, tabs } = props;
    const { onChange, ...rest } = container;

    // State
    const [value, setValue] = React.useState(0);

    // Layout
    return (
        <React.Fragment>
            {inputName && (
                <input type="hidden" name={inputName} value={value} />
            )}
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
                        <Tab key={index} value={index} {...tabRest} />
                    ))}
                </Tabs>
            </Box>
            {tabs.map(({ children, panel }, index) => (
                <Box key={index} hidden={value !== index} {...panel}>
                    {Utils.getResult(children, value === index)}
                </Box>
            ))}
        </React.Fragment>
    );
}
