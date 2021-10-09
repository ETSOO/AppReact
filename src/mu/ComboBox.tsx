import { IdLabelDto } from '@etsoo/appscript';
import { Autocomplete, AutocompleteRenderInputParams } from '@mui/material';
import React from 'react';
import { Utils } from '../app/Utils';
import { AutocompleteExtendedProps } from './AutocompleteExtendedProps';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * ComboBox props
 */
export interface ComboBoxProps<T extends Record<string, any>>
    extends AutocompleteExtendedProps<T> {
    /**
     * Load data callback
     */
    loadData?: () => PromiseLike<T[] | null | undefined>;

    /**
     * Array of options.
     */
    options?: ReadonlyArray<T>;
}

/**
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<T extends Record<string, any> = IdLabelDto>(
    props: ComboBoxProps<T>
) {
    // Destruct
    const {
        search = false,
        idField = 'id',
        idValue,
        inputMargin,
        inputRequired,
        inputVariant,
        defaultValue,
        label,
        loadData,
        name,
        options = [],
        readOnly = true,
        onChange,
        value,
        sx = { minWidth: '150px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Options state
    const [localOptions, setOptions] = React.useState(options);
    const isMounted = React.useRef(true);

    // Local default value
    const localValue =
        idValue != null
            ? localOptions.find((o) => o[idField] === idValue)
            : defaultValue ?? value;

    // Current id value
    const localIdValue = localValue == null ? undefined : localValue[idField];

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });

            if (readOnly) {
                if (params.inputProps == null) params.inputProps = {};
                Object.assign(params.inputProps, { 'data-reset': true });
            }
        }

        return params;
    };

    React.useEffect(() => {
        if (loadData) {
            loadData().then((result) => {
                if (result == null || !isMounted.current) return;
                setOptions(result);
            });
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    // Layout
    return (
        <div>
            <input
                ref={inputRef}
                data-reset="true"
                type="text"
                style={{ display: 'none' }}
                name={name}
                defaultValue={localIdValue}
            />
            {/* Previous input will reset first with "disableClearable = false", next input trigger change works */}
            <Autocomplete
                defaultValue={localValue}
                isOptionEqualToValue={(option: T, value: T) =>
                    option[idField] === value[idField]
                }
                onChange={(event, value, reason, details) => {
                    // Input value
                    const input = inputRef.current;
                    if (input) {
                        // Update value
                        const newValue =
                            value != null && idField in value
                                ? `${value[idField]}`
                                : '';

                        if (newValue !== input.value) {
                            // Different value, trigger change event
                            Utils.triggerChange(input, newValue, false);
                        }
                    }

                    // Custom
                    if (onChange != null)
                        onChange(event, value, reason, details);
                }}
                sx={sx}
                renderInput={(params) =>
                    search ? (
                        <SearchField
                            {...addReadOnly(params)}
                            label={label}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                        />
                    ) : (
                        <InputField
                            {...addReadOnly(params)}
                            label={label}
                            margin={inputMargin}
                            variant={inputVariant}
                            required={inputRequired}
                        />
                    )
                }
                options={localOptions}
                {...rest}
            />
        </div>
    );
}
