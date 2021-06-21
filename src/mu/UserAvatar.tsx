import React from 'react';
import { Avatar } from '@material-ui/core';

/**
 * User avatar props
 */
export interface UserAvatarProps {
    /**
     * Photo src
     */
    src?: string;

    /**
     * Title of the user
     */
    title?: string;
}

const transformTitle = (title?: string) => {
    // Just return for empty cases
    if (title == null || title === '') return undefined;

    // split with words
    const items = title.trim().split(/\s+/g);

    if (items.length === 1) {
        // 2-3 Chinese names
        if (title.length < 4) return title.toUpperCase();

        // Return ME for simplicity
        return 'ME';
    }

    // First letter of each item
    var firstLetters = items
        .map((item) => item[0])
        .join('')
        .toUpperCase();

    if (firstLetters.length < 4) return firstLetters;

    return 'ME';
};

/**
 * User avatar
 * @param props Props
 * @returns Component
 */
export function UserAvatar(props: UserAvatarProps) {
    // Destruct
    const { src, title } = props;

    return (
        <Avatar
            title={title}
            src={src}
            sx={{ width: 48, height: 32, fontSize: '0.8em' }}
        >
            {transformTitle(title)}
        </Avatar>
    );
}
