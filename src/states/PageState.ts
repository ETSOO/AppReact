import { IAction, IState } from "@etsoo/appscript";
import { IProviderProps, IUpdate } from "./IState";
import { State } from "./State";

/**
 * Page data interface
 */
export interface IPageData extends IState {
  /**
   * Page title
   */
  title?: string;

  /**
   * Page subtitle
   */
  subtitle?: string;
}

/**
 * Page action type
 */
export enum PageActionType {
  // Update data
  Data = "DATA",

  // Update title
  Title = "TITLE"
}

/**
 * Page action
 */
export interface PageAction<D extends IPageData> extends IAction {
  /**
   * Action type
   */
  type: PageActionType;

  /**
   * Action data
   */
  data: D;
}

/**
 * Page provider props
 */
export type PageProviderProps<D extends IPageData> = IProviderProps<
  PageAction<D>
>;

/**
 * Page calls with the state
 */
export interface PageCalls<D extends IPageData>
  extends IUpdate<D, PageAction<D>> {}

/**
 * User state
 */
export class PageState<D extends IPageData> {
  /**
   * Context
   */
  readonly context;

  /**
   * Provider
   */
  readonly provider;

  /**
   * Constructor
   */
  constructor() {
    // Act
    const { context, provider } = State.create(
      (state: D, { type, data }: PageAction<D>) => {
        switch (type) {
          case PageActionType.Data:
            // Set page data
            return { ...state, ...data };
          case PageActionType.Title:
            // Same title
            if (state.title === data.title && state.subtitle === data.subtitle)
              return state;

            // Set page title
            return {
              ...state,
              ...data
            };
          default:
            return state;
        }
      },
      {} as D,
      {} as PageCalls<D>
    );

    this.context = context;
    this.provider = provider;
  }
}
