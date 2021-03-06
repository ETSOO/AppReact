/**
 * Combined refs
 * @param refs Refs
 * @returns Callback
 */
export default function useCombinedRefs(
    ...refs: (React.Ref<any> | undefined)[]
) {
    return (target: any) => {
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
                (ref as any).current = target;
            }
        });
    };
}
