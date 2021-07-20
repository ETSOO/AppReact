import {
    Breakpoint,
    Button,
    ButtonProps,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';
import React from 'react';

export interface DialogButtonProps extends ButtonProps {
    /**
     * Dialog content
     */
    content: string;

    /**
     * Show content in pre component
     */
    contentPre?: boolean;

    /**
     * Default is label
     */
    dialogTitle?: string;

    /**
     * Disable the scroll lock behavior.
     * @default false
     */
    disableScrollLock?: boolean;

    /**
     * Show fullscreen dialog
     */
    fullScreen?: boolean;

    /**
     * Max width of the dialog
     */
    maxWidth?: Breakpoint | false;
}

export function DialogButton(props: DialogButtonProps) {
    // Destruct
    const {
        children,
        content,
        contentPre,
        dialogTitle,
        disableScrollLock,
        fullScreen,
        maxWidth,
        onClick,
        ...rest
    } = props;

    // Open state
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Onclick handler
    const onClickLocal = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleClickOpen();
        if (onClick) onClick(event);
    };

    // Layout
    return (
        <React.Fragment>
            <Button {...rest} onClick={onClickLocal}>
                {children}
            </Button>
            <Dialog
                disableScrollLock={disableScrollLock}
                fullScreen={fullScreen}
                maxWidth={maxWidth}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    {dialogTitle ? dialogTitle : children}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        component={contentPre ? 'pre' : 'span'}
                        sx={{ pointerEvents: 'none' }}
                    >
                        {content}
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
