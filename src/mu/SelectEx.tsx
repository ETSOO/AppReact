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
import { ListItemRightIcon } from './ListItemRightIcon';
import { DataTypes, Utils } from '@etsoo/shared';
import { ReactUtils } from '../app/ReactUtils';

/**
 * Extended select component props
 */
export type SelectExProps<
    T extends object,
    D extends DataTypes.Keys<T> = DataTypes.Keys<T>
> = Omit<SelectProps, 'labelId' | 'input' | 'native'> & {
    /**
     * Auto add blank item
     */
    autoAddBlankItem?: boolean;

    /**
     * Item icon renderer
     */
    itemIconRenderer?: (id: unknown) => React.ReactNode;

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
} & (T extends { id: DataTypes.IdType }
        ? {
              idField?: D;
          }
        : {
              idField: D;
          }) &
    (T extends { label: string }
        ? {
              labelField?: ((option: T) => string) | D;
          }
        : {
              labelField: ((option: T) => string) | D;
          });

/**
 * Extended select component
 * @param props Props
 * @returns Component
 */
export function SelectEx<
    T extends object = DataTypes.IdLabelItem,
    D extends DataTypes.Keys<T> = DataTypes.Keys<T>
>(props: SelectExProps<T, D>) {
    // Destruct
    const {
        defaultValue,
        idField = 'id' as D,
        itemIconRenderer,
        label,
        labelField = 'label' as D,
        loadData,
        onItemClick,
        onLoadData,
        multiple = false,
        name,
        options = [],
        search = false,
        autoAddBlankItem = search,
        value,
        onChange,
        fullWidth,
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
                ReactUtils.triggerChange(input, id as string, false);
            }
        }
    };

    // Get option id
    const getId = (option: T) => {
        return option[idField] as unknown as React.Key;
    };

    // Get option label
    const getLabel = (option: T) => {
        return typeof labelField === 'function'
            ? labelField(option)
            : new String(option[labelField]);
    };

    // Refs
    const divRef = React.useRef<HTMLDivElement>();

    // When value change
    React.useEffect(() => {
        if (loadData) {
            loadData().then((result) => {
                if (result == null || !isMounted.current) return;
                if (onLoadData) onLoadData(result);
                if (autoAddBlankItem) {
                    Utils.addBlankItem(result, idField, labelField);
                }
                setOptions(result);
            });
        }
    }, [localValue]);

    // When layout ready
    React.useEffect(() => {
        const input = divRef.current?.querySelector('input');
        const inputChange = (event: Event) => {
            // Reset case
            if (event.cancelable) setValueState(multiple ? [] : '');
        };
        input?.addEventListener('change', inputChange);

        return () => {
            isMounted.current = false;
            input?.removeEventListener('change', inputChange);
        };
    }, []);

    // Layout
    return (
        <FormControl
            size={search ? MUGlobal.searchFieldSize : MUGlobal.inputFieldSize}
            fullWidth={fullWidth}
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
                value={
                    localOptions.some((option) => itemChecked(getId(option)))
                        ? valueState ?? ''
                        : ''
                }
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
                        .filter((option) => {
                            const id = getId(option);
                            return Array.isArray(selected)
                                ? selected.indexOf(id) !== -1
                                : selected === id;
                        })
                        .map((option) => getLabel(option))
                        .join(', ');
                }}
                sx={{ minWidth: '150px' }}
                fullWidth={fullWidth}
                {...rest}
            >
                {localOptions.map((option) => {
                    // Option id
                    const id = getId(option);

                    // Option label
                    const label = getLabel(option);

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
