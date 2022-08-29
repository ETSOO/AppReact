/**
 * Combined refs
 * @param refs Refs
 * @returns Callback
 */
export function useCombinedRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
    return (target: T | null) => {
        // Ignore null reference
        if (target == null) return;

        // Update all refs
        refs.forEach((ref) => {
            // Null ref
            if (!ref) return;

            // Callback function
            if (typeof ref === 'function') {
                ref(target);
            } else {
                // as any to update readonly property
                Reflect.set(ref, 'current', target);
            }
        });
    };
}
