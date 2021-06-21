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

const transformTitle = (title?: string): [string | undefined, number] => {
    // Just return for empty cases
    if (title == null || title === '') return [undefined, 0];

    // split with words
    const items = title.trim().split(/\s+/g);

    if (items.length === 1) {
        // 2-3 Chinese names
        const titleLen = title.length;
        if (titleLen < 4) return [title.toUpperCase(), titleLen];

        // Return ME for simplicity
        return ['ME', 2];
    }

    // First letter of each item
    var firstLetters = items
        .map((item) => item[0])
        .join('')
        .toUpperCase();

    const flen = firstLetters.length;
    if (flen < 4) return [firstLetters, flen];

    return ['ME', 2];
};

/**
 * User avatar
 * @param props Props
 * @returns Component
 */
export function UserAvatar(props: UserAvatarProps) {
    // Destruct
    const { src, title } = props;

    // Format
    const [formatedTitle, count] = transformTitle(title);

    return (
        <Avatar
            title={title}
            src={src}
            sx={{
                width: 48,
                height: 32,
                fontSize: count <= 2 ? '15px' : '12px'
            }}
        >
            {formatedTitle}
        </Avatar>
    );
}
