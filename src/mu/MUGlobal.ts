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
     * Update object number properties with theme
     * @param input Input object
     * @param updateFunc Theme update function
     * @returns Updated object
     */
    static updateWithTheme(
        input: Record<string, any>,
        updateFunc: (value: number) => string
    ) {
        Object.entries(input).forEach(([key, value]) => {
            if (typeof value === 'number') input[key] = updateFunc(value);
        });
        return input;
    }
}
