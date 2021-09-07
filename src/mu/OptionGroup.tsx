import { DataTypes } from '@etsoo/shared';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormControlProps,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup
} from '@mui/material';
import React from 'react';

/**
 * OptionGroup props
 */
export interface OptionGroupProps<T extends Record<string, any>>
    extends Omit<FormControlProps<'fieldset'>, 'defaultValue'> {
    /**
     * Default value
     */
    defaultValue?: string | number | ReadonlyArray<DataTypes.IdType>;

    /**
     * Get option label function
     */
    getOptionLabel?: (option: T) => string;

    /**
     * Id field, default is id
     */
    idField?: string;

    /**
     * Label
     */
    label?: string;

    /**
     * Label field, default is label
     */
    labelField?: string;

    /**
     * Multiple choose item
     */
    multiple?: boolean;

    /**
     * Field name
     */
    name: string;

    /**
     * Array of options.
     */
    options: ReadonlyArray<T>;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

    /**
     * Display group of elements in a compact row
     */
    row?: boolean;
}

/**
 * OptionGroup
 * @param props Props
 * @returns Component
 */
export function OptionGroup<T extends Record<string, any>>(
    props: OptionGroupProps<T>
) {
    // Destruct
    const {
        getOptionLabel,
        defaultValue,
        idField = 'id',
        label,
        labelField = 'label',
        multiple = false,
        name,
        options,
        readOnly,
        row,
        size,
        ...rest
    } = props;

    // Get option value
    const getOptionValue = (option: any) => {
        return option[idField];
    };

    // Item checked
    const itemChecked = (option: T) => {
        if (defaultValue == null) return false;

        // Value
        const value = getOptionValue(option);

        if (Array.isArray(defaultValue)) {
            return defaultValue.findIndex((d: string) => d === value) != -1;
        } else {
            return defaultValue === value;
        }
    };

    // Items
    const list = options.map((option) => {
        // Control
        const control = multiple ? (
            <Checkbox
                name={name}
                readOnly={readOnly}
                size={size}
                defaultChecked={itemChecked(option)}
            />
        ) : (
            <Radio size={size} readOnly={readOnly} />
        );

        // Label
        const label =
            getOptionLabel == null
                ? `${option[labelField]}`
                : getOptionLabel(option);

        // Value, convert to string
        // Will fail when type is number
        const value = getOptionValue(option);

        return (
            <FormControlLabel
                key={value}
                control={control}
                value={value}
                label={label}
            />
        );
    });

    // Group
    const group = multiple ? (
        <FormGroup row={row}>{list}</FormGroup>
    ) : (
        <RadioGroup row={row} name={name} defaultValue={defaultValue}>
            {list}
        </RadioGroup>
    );

    // Layout
    return (
        <FormControl component="fieldset" {...rest}>
            {label && <FormLabel component="legend">{label}</FormLabel>}
            {group}
        </FormControl>
    );
}
