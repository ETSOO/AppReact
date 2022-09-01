import { DataTypes, DomUtils } from '@etsoo/shared';
import { useSearchParams } from 'react-router-dom';

/**
 * Extended useSearchParams of react-router-dom
 * Provide exact type data
 */
export function useSearchParamsEx<T extends DataTypes.BasicTemplate>(
    template: T
) {
    // Get parameters
    const [sp] = useSearchParams();
    const paras = Object.fromEntries(
        Object.keys(template).map((key) => {
            const type = template[key];
            return [key, type.endsWith('[]') ? sp.getAll(key) : sp.get(key)];
        })
    );

    // Return
    return DomUtils.dataAs(paras, template, false);
}
