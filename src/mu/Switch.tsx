import React from 'react';
import { FormControlLabel, FormControlLabelProps } from '@material-ui/core';
import MuiCheckbox from '@material-ui/core/Checkbox';
import MuiSwitch from '@material-ui/core/Switch';

/**
 * Switch props
 */
export interface SwitchProps extends Omit<FormControlLabelProps, 'control'> {
    /**
     * Value, default 'on'
     */
    value?: string;

    /**
     * Is the field read only?
     */
    readOnly?: boolean;

    /**
     * Size
     */
    size?: 'small' | 'medium';

    /**
     * Display as Checkbox
     */
    checkbox?: boolean;
}

/**
 * Switch
 * @param props Props
 * @returns Component
 */
export function Switch(props: SwitchProps) {
    // Destruct
    const {
        defaultChecked,
        defaultValue,
        readOnly,
        size,
        checkbox = false,
        value = 'true',
        ...rest
    } = props;

    // Checked state
    const [controlChecked, setControlChecked] = React.useState(
        defaultChecked ?? defaultValue == value
    );

    // Handle change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setControlChecked(event.target.checked);
    };

    // Control
    const control = checkbox ? (
        <MuiCheckbox
            readOnly={readOnly}
            checked={controlChecked}
            onChange={handleChange}
            size={size}
            value={value}
        />
    ) : (
        <MuiSwitch
            readOnly={readOnly}
            checked={controlChecked}
            onChange={handleChange}
            size={size}
            value={value}
        />
    );

    // Default state
    React.useEffect(() => {
        setControlChecked(controlChecked);
    }, [controlChecked]);

    // Layout
    return <FormControlLabel control={control} {...rest} />;
}
