import { ClickAwayListener, Tooltip, TooltipProps } from '@mui/material';
import React from 'react';

/**
 * Tooltip with click visibility props
 */
export interface TooltipClickProps
    extends Omit<
        TooltipProps,
        | 'children'
        | 'open'
        | 'disableFocusListener'
        | 'disableHoverListener'
        | 'disableTouchListener'
    > {
    children: (
        openTooltip: (newTitle?: string) => void
    ) => React.ReactElement<any, any>;
}

/**
 * Tooltip with click visibility
 * @param props Props
 * @returns Component
 */
export function TooltipClick(props: TooltipClickProps) {
    // Destruct
    const { children, onClose, title, ...rest } = props;

    // State
    const [localTitle, setTitle] = React.useState(title);
    const [open, setOpen] = React.useState(false);

    // Callback for open the tooltip
    const openTooltip = (newTitle?: string) => {
        setOpen(true);
        if (newTitle) setTitle(newTitle);
    };

    // Layout
    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Tooltip
                PopperProps={{
                    disablePortal: true
                }}
                onClose={(event) => {
                    setOpen(false);
                    if (onClose) onClose(event);
                }}
                title={localTitle}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                {...rest}
            >
                {children(openTooltip)}
            </Tooltip>
        </ClickAwayListener>
    );
}
