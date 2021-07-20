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
     * Default is label
     */
    dialogTitle?: string;

    /**
     * Show fullscreen dialog
     */
    fullScreen?: boolean;

    /**
     * Button label
     */
    label: string;

    /**
     * Max width of the dialog
     */
    maxWidth?: Breakpoint | false;
}

export function DialogButton(props: DialogButtonProps) {
    // Destruct
    const {
        content,
        dialogTitle,
        fullScreen,
        label,
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
                {label}
            </Button>
            <Dialog
                fullScreen={fullScreen}
                maxWidth={maxWidth}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>{dialogTitle ?? label}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{content}</DialogContentText>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
