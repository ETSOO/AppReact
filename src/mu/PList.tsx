import React from 'react';

/**
 * Paragraph items list
 * @param items Items
 */
export function PList(items?: string[]) {
    if (items == null || items.length == 0) return <React.Fragment />;

    return items.map((item, index) => {
        return <p key={index}>{item}</p>;
    });
}
