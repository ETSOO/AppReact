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
    extends AutocompleteExtendedProps<T> {}

/**
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<T extends Record<string, any>>(
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
        name,
        options,
        readOnly = true,
        onChange,
        value,
        sx = { minWidth: '120px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Local default value
    const localValue =
        idValue != null
            ? options.find((o) => o[idField] === idValue)
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
                options={options}
                {...rest}
            />
        </div>
    );
}
