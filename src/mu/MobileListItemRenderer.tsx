import {
    Card,
    CardContent,
    CardHeader,
    LinearProgress,
    SxProps,
    Theme
} from '@mui/material';
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

/**
 * Default mobile list item renderer
 * @param param0 List renderer props
 * @param margin Margin
 * @param renderer Renderer for card content
 * @returns Component
 */
export function MobileListItemRenderer<T>(
    { data, itemHeight }: ScrollerListExInnerItemRendererProps<T>,
    margin: {} | [{}, boolean] | (() => SxProps<Theme>),
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

    // Calculate margin
    const calculateMargin = () => {
        if (typeof margin === 'function') return margin();
        if (Array.isArray(margin)) {
            const marginValue = margin[0];
            const isNarrow = margin[1];
            const half = MUGlobal.half(marginValue);
            if (isNarrow) {
                return {
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: half,
                    marginBottom: half
                };
            } else {
                return {
                    marginLeft: half,
                    marginRight: half,
                    marginTop: half,
                    marginBottom: half
                };
            }
        }

        const half = MUGlobal.half(margin);
        return {
            marginLeft: margin,
            marginRight: margin,
            marginTop: half,
            marginBottom: half
        };
    };

    return (
        <Card
            sx={{
                height: (theme) =>
                    MUGlobal.adjustWithTheme(itemHeight, margin, theme.spacing),
                ...calculateMargin()
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
        </Card>
    );
}
