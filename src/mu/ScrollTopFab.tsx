import React from 'react';
import { Fab, useScrollTrigger, Zoom } from '@material-ui/core';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import { CustomFabProps } from './CustomFabProps';

/**
 * Scroll to top fab
 * @returns Component
 */
export function ScrollTopFab(props: CustomFabProps) {
    // Destruct
    const { size, title } = props;

    // Scroll trigger
    const trigger = useScrollTrigger({
        target: window,
        disableHysteresis: true,
        threshold: 120
    });

    // Icon click handler
    const handleClick = () => {
        window.scrollTo({ top: 0 });
    };

    return (
        <Zoom in={trigger}>
            <Fab size={size} title={title} onClick={handleClick}>
                <VerticalAlignTopIcon />
            </Fab>
        </Zoom>
    );
}
