import { NumberUtils } from '@etsoo/shared';
import { Breakpoint, Theme } from '@mui/material';

export class MUGlobal {
    /**
     * Search field shrink
     */
    static searchFieldShrink: boolean = true;

    /**
     * Search field size
     */
    static searchFieldSize: 'small' | 'medium' = 'small';

    /**
     * Search field variant
     */
    static searchFieldVariant: 'standard' | 'filled' | 'outlined' = 'outlined';

    /**
     * Input field shrink
     */
    static inputFieldShrink: boolean = true;

    /**
     * Input field size
     */
    static inputFieldSize: 'small' | 'medium' = 'medium';

    /**
     * Input field variant
     */
    static inputFieldVariant: 'standard' | 'filled' | 'outlined' = 'outlined';

    /**
     * TextField variant
     */
    static textFieldVariant: 'standard' | 'filled' | 'outlined' = 'filled';

    /**
     * Page default paddings
     */
    static pagePaddings = { xs: 2, sm: 3 };

    /**
     * Update object number properties with half of it
     * @param input Input object
     * @returns Updated object
     */
    static half(input: {}) {
        const newObj = { ...input };
        Object.entries(newObj).forEach(([key, value]) => {
            if (typeof value === 'number') {
                Reflect.set(newObj, key, value / 2.0);
            }
        });
        return newObj;
    }

    /**
     * Reverse object number properties, like 5 to -5
     * @param input Input object
     * @returns Updated object
     */
    static reverse(input: {}) {
        const newObj = { ...input };
        Object.entries(newObj).forEach(([key, value]) => {
            if (typeof value === 'number') {
                Reflect.set(newObj, key, -value);
            }
        });
        return newObj;
    }

    /**
     * Update object number properties with adjustment
     * @param input Input object
     * @param adjust Adjust value or new size object
     * @param field Specific field
     * @returns Updated object
     */
    static increase(input: {}, adjust: number | {}, field?: string) {
        const newObj = { ...input };
        Object.entries(newObj).forEach(([key, value]) => {
            if (typeof value === 'number') {
                if (field == null || field === key) {
                    const adjustValue =
                        typeof adjust === 'number'
                            ? adjust
                            : Reflect.get(adjust, key);
                    if (adjustValue == null || typeof adjustValue !== 'number')
                        return;

                    Reflect.set(newObj, key, value + adjustValue);
                }
            }
        });
        return newObj;
    }

    /**
     * Adjust size with theme update
     * @param size Base size
     * @param adjust Adjustment
     * @param updateFunc Theme update function
     * @returns Updated object
     */
    static adjustWithTheme(
        size: number,
        adjust: {},
        updateFunc: (value: number) => string
    ) {
        const newObj = { ...adjust };
        Object.entries(newObj).forEach(([key, value]) => {
            if (typeof value === 'number') {
                const newValue = NumberUtils.parseWithUnit(updateFunc(value));
                if (newValue != null) {
                    Reflect.set(
                        newObj,
                        key,
                        `${size - newValue[0]}${newValue[1]}`
                    );
                }
            }
        });
        return newObj;
    }

    /**
     * Get multple medias theme space
     * @param spaces Spaces
     * @param theme Theme
     * @returns Result
     */
    static getSpace(spaces: {}, theme: Theme) {
        for (const [key, value] of Object.entries(spaces)) {
            if (
                typeof value === 'number' &&
                theme.breakpoints.keys.findIndex((bk) => bk === key) != -1
            ) {
                const mediaRaw = theme.breakpoints.up(key as Breakpoint);
                const mediaQuery = mediaRaw.substring(mediaRaw.indexOf('('));
                if (window.matchMedia(mediaQuery).matches) {
                    return parseInt(theme.spacing(value), 10);
                }
            }
        }
        return 0;
    }

    /**
     * Update object number properties with theme
     * @param input Input object
     * @param updateFunc Theme update function
     * @returns Updated object
     */
    static updateWithTheme(input: {}, updateFunc: (value: number) => string) {
        const newObj = { ...input };
        Object.entries(newObj).forEach(([key, value]) => {
            if (typeof value === 'number') {
                Reflect.set(newObj, key, updateFunc(value));
            }
        });
        return newObj;
    }
}
