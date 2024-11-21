import { IAction, ICulture } from "@etsoo/appscript";
import { DataTypes } from "@etsoo/shared";
import { IProviderProps, IUpdate } from "./IState";
import { State } from "./State";

/**
 * Culture action to manage resources
 */
export interface CultureAction extends ICulture, IAction {}

/**
 * Culture calls with the state
 */
export interface CultureCalls extends IUpdate<ICulture, CultureAction> {
  /**
   * Key value
   * @param key Item key
   */
  get<T = string>(key: string): T | undefined;
}

/**
 * Culture provider props
 */
export type CultureProviderProps = IProviderProps<CultureAction>;

// Calls
const calls = {
  /**
   * Key value
   * @param key Item key
   */
  get<T = string>(key: string) {
    const resources = this.state.resources;
    const value = typeof resources === "object" ? resources[key] : undefined;
    if (value == null) return undefined;
    return value as T;
  }
} as CultureCalls;

/**
 * Culture state
 * Creator for culture context and provider globally, not inside a component to avoid problem:
 * Cannot update a component (`provider`) while rendering a different component
 */
export class CultureState {
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
  constructor(item?: DataTypes.CultureDefinition) {
    // Default
    const defaultItem = item ?? ({} as ICulture);

    // Load resources
    if (item != null && typeof item.resources !== "object")
      item.resources().then((result) => (item.resources = result));

    // Act
    const { context, provider } = State.create(
      (state: ICulture, action: CultureAction) => {
        // Language reducer
        if (state.name !== action.name) {
          return { ...action };
        }

        return state;
      },
      defaultItem,
      calls
    );

    this.context = context;
    this.provider = provider;
  }
}
