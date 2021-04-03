import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip
} from '@material-ui/core';
import { Language } from '@material-ui/icons';
import { DataTypes } from '@etsoo/shared';

/**
 * Language chooser properties
 */
export interface LanguageChooserProps {
    /**
     * Style class name
     */
    className?: string;

    /**
     * Close event
     */
    onClose?(item?: DataTypes.LanguageDefinition): void;

    /**
     * Current selected language
     */
    selectedValue?: string;

    /**
     * Title
     */
    title?: string;

    /**
     * Items
     */
    items: DataTypes.LanguageDefinition[];
}

/**
 * Language chooser component
 * @param props Properties
 */
export function LanguageChooser(props: LanguageChooserProps) {
    //  properties destructure
    const { className, items, onClose, selectedValue, title } = props;

    // Dialog open or not state
    const [open, setOpen] = React.useState(false);

    // Current language state
    let defaultLanguageItem = items.find((item) => item.name === selectedValue);
    if (defaultLanguageItem == null) {
        defaultLanguageItem = items[0];
    }

    const [languageItem, setLanguageItem] = React.useState(defaultLanguageItem);

    // Click handler
    const clickHandler = () => {
        // More than one language
        if (items.length < 2) {
            return;
        }

        // Open the dialog
        setOpen(true);
    };

    // Close handler
    const closeHandler = () => {
        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(languageItem);
        }
    };

    // Close item handler
    const closeItemHandler = (item: DataTypes.LanguageDefinition) => {
        // Update the current item
        setLanguageItem(item);

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(item);
        }
    };

    return (
        <>
            <Tooltip title={languageItem.label} aria-label="Current language">
                <IconButton
                    color="primary"
                    className={className}
                    aria-label="Language"
                    onClick={clickHandler}
                >
                    <Language />
                </IconButton>
            </Tooltip>
            <Dialog
                aria-labelledby="dialog-title"
                open={open}
                onClose={closeHandler}
            >
                <DialogTitle id="dialog-title">{title || ''}</DialogTitle>
                <List>
                    {items.map((item) => (
                        <ListItem
                            button
                            key={item.name}
                            disabled={item.name === languageItem.name}
                            onClick={() => closeItemHandler(item)}
                        >
                            <ListItemText>{item.label}</ListItemText>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
        </>
    );
}
