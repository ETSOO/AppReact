import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
    DialogContent
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
    onClose?(item?: DataTypes.CultureDefinition): void;

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
    items: DataTypes.CultureDefinition[];
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

    // Default culture state
    const defaultItem = items.find((item) => item.name === selectedValue) ?? items[0];

    // Culture item
    const [cultureItem, setCultureItem] = React.useState(defaultItem);

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
            onClose(cultureItem);
        }
    };

    // Close item handler
    const closeItemHandler = (item: DataTypes.CultureDefinition) => {
        // Update the current item
        setCultureItem(item);

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(item);
        }
    };

    return (
        <>
            <Tooltip title={cultureItem.label} aria-label="Current language">
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
                <DialogTitle sx={{ minWidth: '200px' }} id="dialog-title">
                    {title || ''}
                </DialogTitle>
                <DialogContent>
                    <List>
                        {items.map((item) => (
                            <ListItem
                                button
                                key={item.name}
                                disabled={item.name === cultureItem.name}
                                onClick={() => closeItemHandler(item)}
                            >
                                <ListItemText>{item.label}</ListItemText>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
}
