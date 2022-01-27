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
import { IdLabelDto } from '@etsoo/appscript';
import { ListItemRightIcon } from './ListItemRightIcon';

/**
 * Extended select component props
 */
export interface SelectExProps<T extends {}>
    extends Omit<SelectProps, 'labelId' | 'input' | 'native'> {
    /**
     * Id field, default is id
     */
    idField?: string & keyof T;

    /**
     * Item icon renderer
     */
    itemIconRenderer?: (id: unknown) => React.ReactNode;

    /**
     * Label field, default is label
     */
    labelField?: ((option: T) => string) | (string & keyof T);

    /**
     * Load data callback
     */
    loadData?: () => PromiseLike<T[] | null | undefined>;

    /**
     * Item click handler
     */
    onItemClick?: (event: React.MouseEvent, id: unknown) => void;

    /**
     * On load data handler
     */
    onLoadData?: (options: T[]) => void;

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
export function SelectEx<T extends {} = IdLabelDto>(props: SelectExProps<T>) {
    // Destruct
    const {
        defaultValue,
        idField = 'id',
        itemIconRenderer,
        label,
        labelField = 'label',
        loadData,
        onItemClick,
        onLoadData,
        multiple = false,
        name,
        options = [],
        search = false,
        value,
        onChange,
        ...rest
    } = props;

    // Options state
    const [localOptions, setOptions] = React.useState(options);
    const isMounted = React.useRef(true);

    // When options change
    // [options] will cause infinite loop
    const propertyWay = loadData == null;
    React.useEffect(() => {
        if (propertyWay && options != null) setOptions(options);
    }, [JSON.stringify(options), propertyWay]);

    // Local value
    const valueSource = defaultValue ?? value ?? '';
    let localValue: unknown | unknown[];
    if (multiple) {
        if (Array.isArray(valueSource)) localValue = valueSource;
        else localValue = [valueSource];
    } else {
        localValue = valueSource;
    }

    // Value state
    const [valueState, setValueState] = React.useState<unknown>();

    React.useEffect(() => {
        if (localValue != null) setValueState(localValue);
    }, [localValue]);

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
        const inputChange = (event: Event) => {
            // Reset case
            if (event.cancelable) setValueState(multiple ? [] : '');
        };
        input?.addEventListener('change', inputChange);

        if (loadData) {
            loadData().then((result) => {
                if (result == null || !isMounted.current) return;
                if (onLoadData) onLoadData(result);
                setOptions(result);
            });
        }

        return () => {
            isMounted.current = false;
            input?.removeEventListener('change', inputChange);
        };
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
                value={localOptions.length > 0 ? valueState ?? '' : ''}
                input={<OutlinedInput notched label={label} />}
                labelId={labelId}
                name={name}
                multiple={multiple}
                onChange={(event, child) => {
                    if (onChange) onChange(event, child);
                    if (multiple) handleChange(event);
                }}
                renderValue={(selected) => {
                    // The text shows up
                    return localOptions
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
                {localOptions.map((option: any) => {
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
                            onClick={(event) => {
                                if (onItemClick) {
                                    onItemClick(event, id);
                                    if (event.defaultPrevented) return;
                                }
                                if (!multiple) setItemValue(id);
                            }}
                        >
                            {multiple && <Checkbox checked={itemChecked(id)} />}
                            <ListItemText primary={label} />
                            {itemIconRenderer && (
                                <ListItemRightIcon>
                                    {itemIconRenderer(id)}
                                </ListItemRightIcon>
                            )}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
