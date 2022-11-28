import React from 'react';

/**
 * Hook for checking printing status
 * @returns Result
 */
export function useIsPrinting() {
    // State
    const [isPrinting, setIsPrinting] = React.useState(false);

    const handleBeforeprint = () => setIsPrinting(true);
    const handleAfterprint = () => setIsPrinting(false);

    React.useEffect(() => {
        window.addEventListener('beforeprint', handleBeforeprint);
        window.addEventListener('afterprint', handleAfterprint);
        return () => {
            window.removeEventListener('beforeprint', handleBeforeprint);
            window.removeEventListener('afterprint', handleAfterprint);
        };
    }, []);

    return isPrinting;
}
