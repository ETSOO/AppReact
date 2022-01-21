import { Card, CardContent, CardHeader, LinearProgress } from '@mui/material';
import React from 'react';
import { ListItemReact } from '../components/ListItemReact';
import { MoreFab } from './MoreFab';
import { ScrollerListExInnerItemRendererProps } from './ScrollerListEx';

function getActions(input: (ListItemReact | boolean)[]): ListItemReact[] {
    // Actions
    const actions: ListItemReact[] = [];
    input.forEach((action) => {
        if (typeof action === 'boolean') return;
        actions.push(action);
    });
    return actions;
}

/**
 * Default mobile list item renderer
 * @param param0 List renderer props
 * @param margin Margin
 * @param renderer Renderer for card content
 * @returns Component
 */
export function MobileListItemRenderer<T>(
    { data, itemHeight, margins }: ScrollerListExInnerItemRendererProps<T>,
    renderer: (
        data: T
    ) => [
        string,
        string | undefined,
        React.ReactNode | (ListItemReact | boolean)[],
        React.ReactNode,
        React.ReactNode?
    ]
) {
    // Loading
    if (data == null) return <LinearProgress />;

    // Elements
    const [title, subheader, actions, children, cardActions] = renderer(data);

    return (
        <Card
            sx={{
                height: itemHeight,
                ...margins
            }}
        >
            <CardHeader
                sx={{ paddingBottom: 0.5 }}
                action={
                    Array.isArray(actions) ? (
                        <MoreFab
                            iconButton
                            size="small"
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            actions={getActions(actions)}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: -0.4,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1
                                    },
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform:
                                            'translateY(-50%) rotate(45deg)',
                                        zIndex: 0
                                    }
                                }
                            }}
                        />
                    ) : (
                        actions
                    )
                }
                title={title}
                titleTypographyProps={{ variant: 'body2' }}
                subheader={subheader}
                subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent
                sx={{
                    paddingTop: 0
                }}
            >
                {children}
            </CardContent>
            {cardActions && cardActions}
        </Card>
    );
}
