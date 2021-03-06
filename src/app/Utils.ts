/**
 * React utils
 */
export namespace Utils {
    /**
     * Trigger input change event
     * @param input Form input
     * @param value New value
     * @param cancelable Cancelable
     */
    export function triggerChange(
        input: HTMLInputElement,
        value: string,
        cancelable: boolean
    ) {
        // Radio type not supported
        if (input.type === 'radio') return;

        // checked?
        const checked = input.type === 'checkbox';

        // Property name
        const property = checked ? 'checked' : 'value';

        // input.value = newValue will not trigger the change event
        // input type = 'hidden' will also not trigger the event
        // https://coryrylan.com/blog/trigger-input-updates-with-react-controlled-inputs
        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            property
        )?.set;

        if (checked) {
            const checkedValue = input.value == value;
            nativeInputValueSetter?.call(input, checkedValue);

            const clickEvent = new Event('click', {
                bubbles: true,
                cancelable
            });
            input.dispatchEvent(clickEvent);
        } else {
            nativeInputValueSetter?.call(input, value);

            const inputEvent = new Event('change', {
                bubbles: true,
                cancelable
            });
            input.dispatchEvent(inputEvent);
        }
    }
}
