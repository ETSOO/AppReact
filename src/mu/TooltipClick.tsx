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
    // leaveDelay set to 5 seconds to hide the tooltip automatically
    const { children, leaveDelay = 5000, onClose, title, ...rest } = props;

    // State
    const [localTitle, setTitle] = React.useState(title);
    const [open, setOpen] = React.useState(false);
    const leaveSeed = React.useRef(0);

    // Callback for open the tooltip
    const openTooltip = (newTitle?: string) => {
        setOpen(true);
        if (newTitle) setTitle(newTitle);

        if (leaveDelay > 0) {
            clearLeaveSeed();
            leaveSeed.current = window.setTimeout(
                () => setOpen(false),
                leaveDelay
            );
        }
    };

    const clearLeaveSeed = () => {
        if (leaveSeed.current > 0) {
            window.clearTimeout(leaveSeed.current);
            leaveSeed.current = 0;
        }
    };

    React.useEffect(() => {
        return () => {
            clearLeaveSeed();
        };
    }, []);

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
