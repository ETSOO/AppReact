import React from 'react';

/**
 * Paragraph items list
 * @param items Items
 */
export function PList(items: string[]) {
    return items.map((item, index) => {
        return <p key={index}>{item}</p>;
    });
}
