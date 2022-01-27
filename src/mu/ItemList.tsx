import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    DialogContent,
    Button
} from '@mui/material';
import { DataTypes } from '@etsoo/shared';

/**
 * Item list properties
 */
export interface ItemListProps<T extends Record<string, unknown>> {
    /**
     * Style class name
     */
    className?: string;

    /**
     * Id field name
     */
    idField?: string & keyof T;

    /**
     * Label field name or callback
     */
    labelField?: (string & keyof T) | ((item: T) => string);

    /**
     * Button icon
     */
    icon?: React.ReactNode;

    /**
     * Button color
     */
    color?: 'inherit' | 'primary' | 'secondary';

    /**
     * Close event
     */
    onClose?(item: T, changed: boolean): void;

    /**
     * Current selected language
     */
    selectedValue?: string;

    /**
     * Button size
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Title
     */
    title?: string;

    /**
     * Items
     */
    items: T[];

    /**
     * Button variant
     */
    variant?: 'text' | 'outlined' | 'contained';
}

/**
 * Item list component
 * @param props Properties
 */
export function ItemList<
    T extends Record<string, unknown> = Record<string, unknown>
>(props: ItemListProps<T>) {
    //  properties destructure
    const {
        className,
        color = 'primary',
        items,
        idField = 'id',
        labelField = 'label',
        icon,
        onClose,
        selectedValue,
        size = 'medium',
        title,
        variant = 'outlined'
    } = props;

    // Get id
    const getId = (item: T): string | number => {
        const id = item[idField];
        if (typeof id === 'number') return id;
        return DataTypes.convert(id, 'string') ?? '';
    };

    // Get label
    const getLabel = (item: T): string => {
        if (typeof labelField === 'function') {
            return labelField(item);
        } else {
            return DataTypes.convert(item[labelField], 'string') ?? '';
        }
    };

    // Dialog open or not state
    const [open, setOpen] = React.useState(false);

    // Default state
    const defaultItem =
        items.find((item) => getId(item) === selectedValue) ?? items[0];

    // Current item
    const [currentItem, setCurrentItem] = React.useState(defaultItem);

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
        if (!open) return;

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(currentItem, false);
        }
    };

    // Close item handler
    const closeItemHandler = (item: any) => {
        // Update the current item
        setCurrentItem(item);

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(item, true);
        }
    };

    return (
        <>
            <Button
                className={className}
                variant={variant}
                startIcon={icon}
                color={color}
                size={size}
                onClick={clickHandler}
            >
                {getLabel(currentItem)}
            </Button>
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
                        {items.map((item) => {
                            const id = getId(item);
                            return (
                                <ListItem
                                    button
                                    key={id}
                                    disabled={id === getId(currentItem)}
                                    onClick={() => closeItemHandler(item)}
                                >
                                    <ListItemText>
                                        {getLabel(item)}
                                    </ListItemText>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
}
