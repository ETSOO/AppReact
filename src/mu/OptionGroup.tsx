import { DataTypes, Utils } from '@etsoo/shared';
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
export interface OptionGroupProps<
    T extends {} = DataTypes.IdLabelItem,
    D extends DataTypes.Keys<T> = DataTypes.Keys<T>
> extends Omit<FormControlProps<'fieldset'>, 'defaultValue'> {
    /**
     * Default value
     */
    defaultValue?: T[D] | T[D][];

    /**
     * Get option label function
     */
    getOptionLabel?: (option: T) => string;

    /**
     * Id field, default is id
     */
    idField: T extends DataTypes.IdLabelItem ? D | undefined : D;

    /**
     * Label
     */
    label?: string;

    /**
     * Label field, default is label
     */
    labelField: T extends DataTypes.IdLabelItem ? D | undefined : D;

    /**
     * Multiple choose item
     */
    multiple?: boolean;

    /**
     * Field name
     */
    name: string;

    /**
     * On value change handler
     */
    onValueChange?: (value: T[D] | T[D][] | undefined) => void;

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
export function OptionGroup<
    T extends {} = DataTypes.IdLabelItem,
    D extends DataTypes.Keys<T> = DataTypes.Keys<T>
>(props: OptionGroupProps<T, D>) {
    // Destruct
    const {
        getOptionLabel,
        defaultValue,
        idField = 'id' as D,
        label,
        labelField = 'label' as D,
        multiple = false,
        name,
        onValueChange,
        options,
        readOnly,
        row,
        size,
        ...rest
    } = props;

    // Get option value
    // D type should be the source id type
    const getOptionValue = (option: T): T[D] | null => {
        const value = DataTypes.getValue(option, idField);
        if (value == null) return null;
        return value as T[D];
    };

    // Checkbox values
    const [values, setValues] = React.useState(
        defaultValue == null
            ? []
            : Array.isArray(defaultValue)
            ? defaultValue
            : [defaultValue]
    );

    // Item checked
    const itemChecked = (option: T) => {
        // Value
        const value = getOptionValue(option);
        if (value == null) return false;

        return values.includes(value);
    };

    // First item value
    const firstOptionValue = getOptionValue(options[0]);

    // Items
    const list = options.map((option) => {
        // Control
        const control = multiple ? (
            <Checkbox
                name={name}
                readOnly={readOnly}
                size={size}
                checked={itemChecked(option)}
                onChange={(event) => {
                    if (firstOptionValue == null) return;

                    const typeValue = Utils.parseString(
                        event.target.value,
                        firstOptionValue
                    );

                    const changedValues = [...values];
                    if (event.target.checked) {
                        if (changedValues.includes(typeValue)) return;
                        changedValues.push(typeValue);
                    } else {
                        const index = changedValues.findIndex(
                            (v) => v === typeValue
                        );
                        if (index === -1) return;
                        changedValues.splice(index, 1);
                    }

                    if (onValueChange) onValueChange(changedValues);
                    setValues(changedValues);
                }}
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
        const value = getOptionValue(option) as unknown as React.Key;

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
        <RadioGroup
            row={row}
            name={name}
            value={values[0]}
            onChange={(_event, value) => {
                if (firstOptionValue == null) return;
                const typeValue = Utils.parseString(value, firstOptionValue);
                if (onValueChange) onValueChange(typeValue);
                setValues([typeValue]);
            }}
        >
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
