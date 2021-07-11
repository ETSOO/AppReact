import {
    Autocomplete,
    AutocompleteProps,
    AutocompleteRenderInputParams
} from '@material-ui/core';
import React from 'react';
import { Labels } from '../app/Labels';
import { Utils } from '../app/Utils';
import { InputField } from './InputField';
import { SearchField } from './SearchField';

/**
 * ComboBox props
 */
export interface ComboBoxProps<T>
    extends Omit<AutocompleteProps<T, undefined, false, false>, 'renderInput'> {
    /**
     * Id field, default is id
     */
    idField?: string;

    /**
     * Id value
     */
    idValue?: string | number;

    /**
     * Label of the field
     */
    label: string;

    /**
     * Name of the field
     */
    name: string;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

    /**
     * Is search field?
     */
    search?: boolean;
}

/**
 * ComboBox
 * @param props Props
 * @returns Component
 */
export function ComboBox<T = any>(props: ComboBoxProps<T>) {
    // Labels
    const labels = Labels.AutoComplete;

    // Destruct
    const {
        search = false,
        idField = 'id',
        idValue,
        defaultValue,
        label,
        name,
        options,
        clearText = labels.clear,
        closeText = labels.close,
        loadingText = labels.loading,
        noOptionsText = labels.noOptions,
        getLimitTagsText = (more: number) =>
            labels.moreTag.replace('{0}', more.toString()),
        openText = labels.open,
        readOnly,
        onChange,
        sx = { minWidth: '120px' },
        ...rest
    } = props;

    // Value input ref
    const inputRef = React.createRef<HTMLInputElement>();

    // Local default value
    const localDefaultValue = idValue
        ? options.find((o) => (o as any)[idField] == idValue)
        : defaultValue;

    // Add readOnly
    const addReadOnly = (params: AutocompleteRenderInputParams) => {
        if (readOnly != null) {
            Object.assign(params, { readOnly });
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
                defaultValue={idValue}
            />
            {/* Previous input will reset first, next input trigger change works */}
            <Autocomplete
                clearText={clearText}
                closeText={closeText}
                defaultValue={localDefaultValue}
                loadingText={loadingText}
                noOptionsText={noOptionsText}
                getLimitTagsText={getLimitTagsText}
                openText={openText}
                onChange={(event, value, reason, details) => {
                    // Input value
                    const input = inputRef.current;
                    if (input) {
                        // Update value
                        const newValue =
                            value != null && idField in value
                                ? `${(value as any)[idField]}`
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
                            readOnly={readOnly}
                            {...params}
                            label={label}
                        />
                    ) : (
                        <InputField {...addReadOnly(params)} label={label} />
                    )
                }
                options={options}
                {...rest}
            />
        </div>
    );
}
