import { IdLabelDto } from '@etsoo/appscript';
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
    T extends Record<string, any> = IdLabelDto,
    D extends DataTypes.IdType = string
> extends Omit<FormControlProps<'fieldset'>, 'defaultValue'> {
    /**
     * Default value
     */
    defaultValue?: D | D[];

    /**
     * Get option label function
     */
    getOptionLabel?: (option: T) => string;

    /**
     * Id field, default is id
     */
    idField?: string & keyof T;

    /**
     * Label
     */
    label?: string;

    /**
     * Label field, default is label
     */
    labelField?: string & keyof T;

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
    onValueChange?: (value: D | D[] | undefined) => void;

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
    T extends Record<string, unknown> = IdLabelDto,
    D extends DataTypes.IdType = string
>(props: OptionGroupProps<T, D>) {
    // Destruct
    const {
        getOptionLabel,
        defaultValue,
        idField = 'id',
        label,
        labelField = 'label',
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
    const getOptionValue = (option: T): D | null => {
        const value = DataTypes.getIdValue(option, idField);
        if (value == null) return null;
        return value as D;
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

                    const typeValue = Utils.parseString<D>(
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
        <RadioGroup
            row={row}
            name={name}
            value={defaultValue}
            onChange={(_event, value) => {
                if (firstOptionValue == null) return;
                const typeValue = Utils.parseString<D>(value, firstOptionValue);
                if (onValueChange) onValueChange(typeValue);
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
