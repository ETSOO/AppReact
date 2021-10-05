import { Utils as AppUtils } from '../app/Utils';
import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    SelectProps
} from '@mui/material';
import React from 'react';
import { MUGlobal } from './MUGlobal';

/**
 * Extended select component props
 */
export interface SelectExProps<T = any>
    extends Omit<SelectProps, 'labelId' | 'input' | 'native'> {
    /**
     * Id field, default is id
     */
    idField?: string;

    /**
     * Label field, default is label
     */
    labelField?: ((option: T) => string) | string;

    /**
     * Array of options.
     */
    options?: ReadonlyArray<T>;

    /**
     * Is search case?
     */
    search?: boolean;
}

/**
 * Extended select component
 * @param props Props
 * @returns Component
 */
export function SelectEx<T = any>(props: SelectExProps<T>) {
    // Destruct
    const {
        defaultValue,
        idField = 'id',
        label,
        labelField = 'label',
        multiple = false,
        name,
        options = [],
        search = false,
        value,
        ...rest
    } = props;

    // Local value
    const valueSource = defaultValue ?? value ?? '';
    let localValue: unknown | unknown[];
    if (multiple) {
        if (Array.isArray(valueSource)) localValue = valueSource;
        else localValue = [valueSource];
    } else {
        localValue = valueSource;
    }

    // State
    const [valueState, setValueState] = React.useState(localValue);

    // Label id
    const labelId = `selectex-label-${name}`;

    // Item checked or not
    const itemChecked = (id: unknown) => {
        if (Array.isArray(valueState)) return valueState.indexOf(id) !== -1;
        return valueState === id;
    };

    // Change handler
    const handleChange = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value;
        if (multiple && !Array.isArray(value)) setItemValue([value]);
        else setItemValue(value);
    };

    // Set item
    const setItemValue = (id: unknown) => {
        if (id != valueState) {
            setValueState(id);

            const input = divRef.current?.querySelector('input');
            if (input) {
                // Different value, trigger change event
                AppUtils.triggerChange(input, id as string, false);
            }
        }
    };

    // Refs
    const divRef = React.useRef<HTMLDivElement>();

    // When layout ready
    React.useEffect(() => {
        const input = divRef.current?.querySelector('input');
        if (input)
            input.addEventListener('change', (event) => {
                // Reset case
                if (event.cancelable) setValueState(multiple ? [] : '');
            });
    }, []);

    // Layout
    return (
        <FormControl
            size={search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize}
        >
            <InputLabel
                id={labelId}
                shrink={
                    search
                        ? MUGlobal.searchFieldShrink
                        : MUGlobal.inputFieldShrink
                }
            >
                {label}
            </InputLabel>
            <Select
                ref={divRef}
                value={valueState}
                input={<OutlinedInput notched label={label} />}
                labelId={labelId}
                name={name}
                multiple={multiple}
                onChange={multiple ? handleChange : undefined}
                renderValue={(selected) => {
                    // The text shows up
                    return options
                        .filter((option: any) =>
                            Array.isArray(selected)
                                ? selected.indexOf(option.id) !== -1
                                : selected === option.id
                        )
                        .map((option: any) => option.label)
                        .join(', ');
                }}
                sx={{ minWidth: '150px' }}
                {...rest}
            >
                {options.map((option: any) => {
                    // Option id
                    const id = option[idField];

                    // Option label
                    const label =
                        typeof labelField === 'function'
                            ? labelField(option)
                            : option[labelField];

                    // Option
                    return (
                        <MenuItem
                            key={id}
                            value={id}
                            onClick={
                                multiple ? undefined : () => setItemValue(id)
                            }
                        >
                            {multiple && <Checkbox checked={itemChecked(id)} />}
                            <ListItemText primary={label} />
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
