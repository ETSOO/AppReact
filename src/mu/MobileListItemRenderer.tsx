import { Card, CardContent, CardHeader, LinearProgress } from '@mui/material';
import React from 'react';
import { ListItemReact } from '../components/ListItemReact';
import { MoreFab } from './MoreFab';
import { MUGlobal } from './MUGlobal';
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

export function MobileListItemRenderer<T>(
    { data, itemHeight }: ScrollerListExInnerItemRendererProps<T>,
    margin: {},
    renderer: (
        data: T
    ) => [
        string,
        string | undefined,
        React.ReactNode | (ListItemReact | boolean)[],
        React.ReactNode
    ]
) {
    // Loading
    if (data == null) return <LinearProgress />;

    // Elements
    const [title, subheader, actions, children] = renderer(data);

    // Half
    const halfMargin = MUGlobal.half(margin);

    return (
        <Card
            sx={{
                height: (theme) =>
                    MUGlobal.adjustWithTheme(itemHeight, margin, theme.spacing),
                marginLeft: margin,
                marginRight: margin,
                marginTop: halfMargin,
                marginBottom: halfMargin
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
            <CardContent sx={{ paddingTop: 0 }}>{children}</CardContent>
        </Card>
    );
}
