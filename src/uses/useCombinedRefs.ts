/**
 * Combined refs
 * @param refs Refs
 * @returns Callback
 */
export default function useCombinedRefs(
    ...refs: (React.Ref<any> | undefined)[]
) {
    return (target: any) => {
        refs.forEach((ref) => {
            if (!ref) return;

            if (typeof ref === 'function') {
                ref(target);
            } else {
                (ref as any).current = target;
            }
        });
    };
}
