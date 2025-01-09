import React from "react";

/**
 * Required context
 * @param context Context
 * @returns Value
 */
export function useRequiredContext<T>(context: React.Context<T>) {
  const value = React.useContext(context);

  if (value == null) {
    throw new Error(`useRequiredContext: ${context.displayName} is required`);
  }

  return value;
}
