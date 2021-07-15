import { IAction, IState } from '@etsoo/appscript';
import { IProviderProps, IUpdate } from './IState';
import { State } from './State';

/**
 * Page state
 */
export interface IPageState extends IState {
    /**
     * Page title
     */
    title?: string;

    /**
     * Page data
     */
    data?: {};
}

/**
 * Page action type
 */
export enum PageActionType {
    // Update data
    Data = 'DATA',

    // Update title
    Title = 'TITLE'
}

/**
 * Page action
 */
export interface PageAction extends IAction, IPageState {
    /**
     * Action type
     */
    type: PageActionType;
}

/**
 * Page provider props
 */
export type PageProviderProps = IProviderProps<PageAction>;

/**
 * Page calls with the state
 */
export interface PageCalls extends IUpdate<IPageState, PageAction> {}

/**
 * User state
 */
export class PageState {
    /**
     * Context
     */
    readonly context: React.Context<PageCalls>;

    /**
     * Provider
     */
    readonly provider: React.FunctionComponent<PageProviderProps>;

    /**
     * Constructor
     */
    constructor() {
        // Act
        const { context, provider } = State.create(
            (state: IPageState, action: PageAction) => {
                switch (action.type) {
                    case PageActionType.Data:
                        // Set page data
                        return { ...state, data: action.data ?? {} };
                    case PageActionType.Title:
                        // Set page title
                        return {
                            ...state,
                            title: action.title,
                            data: action.data ?? {}
                        };
                    default:
                        return state;
                }
            },
            {} as IPageState,
            {} as PageCalls
        );

        this.context = context;
        this.provider = provider;
    }
}
