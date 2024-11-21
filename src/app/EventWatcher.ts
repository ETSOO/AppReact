import React from "react";

/**
 * Event watcher action
 */
export interface EventWatcherAction {
  /**
   * Event type
   */
  type?: string | string[];

  /**
   * Once action or not
   */
  once?: boolean;

  /**
   * Action
   */
  action: (event: React.BaseSyntheticEvent | string) => any;
}

/**
 * Event watcher
 */
export class EventWatcher {
  private actions: EventWatcherAction[] = [];

  /**
   * Add action
   * @param action Action
   */
  add(action: EventWatcherAction) {
    this.actions.push(action);
  }

  /**
   * Do the event
   * @param event Event
   */
  do(event: React.BaseSyntheticEvent | string) {
    // Type
    const type = typeof event === "string" ? event : event.type;

    // Execute
    const removeIndices: number[] = [];
    this.actions.forEach((item, index) => {
      if (!this.isMatch(item, type)) return;
      item.action(event);
      if (item.once) removeIndices.push(index);
    });

    // Remove all once actions
    removeIndices.reverse().forEach((index) => this.actions.splice(index, 1));
  }

  private isMatch(action: EventWatcherAction, type: string) {
    if (action.type == null) return true;
    if (typeof action.type === "string") return action.type === type;
    return action.type.includes(type);
  }
}
