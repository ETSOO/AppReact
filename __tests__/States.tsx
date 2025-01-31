import React from "react";
import { render, screen } from "@testing-library/react";
import { useAsyncState } from "../src/uses/useAsyncState";
import { act } from "react";

function App(props: { callback: (state: number) => void }) {
  const { callback } = props;
  const [state, setState] = useAsyncState(0);

  const [state1] = useAsyncState<number>();
  expect(state1).toBeUndefined();

  const click = async () => {
    const currentState = await setState((prev) => prev + 1);
    callback(currentState + 1);
  };
  callback(state);
  return <button onClick={click}>State: {state}</button>;
}

test("Tests for useAsyncState", async () => {
  const callback = vi.fn();
  render(<App callback={callback} />);
  const button = screen.getByRole<HTMLButtonElement>("button");
  expect(button.innerHTML).toBe("State: 0");
  act(() => {
    button.click();
  });

  expect(button.innerHTML).toBe("State: 1");

  // Wait for the state to be updated
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Expect to happen
  expect(callback).toHaveBeenLastCalledWith(2);
});
