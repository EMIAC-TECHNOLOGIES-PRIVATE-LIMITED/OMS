import * as React from "react";

type HistoryState<T> = {
  past: T[];
  present: T | null;
  future: T[];
};

type Action<T> =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET"; newPresent: T }
  | { type: "CLEAR"; initialPresent: T };

const initialUseHistoryState = <T,>(initialPresent: T): HistoryState<T> => ({
  past: [],
  present: initialPresent,
  future: [],
});

function useHistoryStateReducer<T>(
  state: HistoryState<T>,
  action: Action<T>,
  maxHistorySize: number
): HistoryState<T> {
  const { past, present, future } = state;

  switch (action.type) {
    case "UNDO":
      if (!past.length) return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future].filter((p) => p !== null) as T[],
      };

    case "REDO":
      if (!future.length) return state;
      return {
        past: present !== null ? [...past, present] : past,
        present: future[0],
        future: future.slice(1),
      };

    case "SET": {
      if (action.newPresent === present) return state;
      const newPast = present !== null ? [...past, present] : past;
      if (newPast.length > maxHistorySize) {
        newPast.shift();
      }
      return {
        past: newPast,
        present: action.newPresent,
        future: [],
      };
    }

    case "CLEAR":
      return initialUseHistoryState(action.initialPresent);

    default:
      throw new Error("Unsupported action type");
  }
}

export function useHistoryState<T>(initialPresent: T, maxHistorySize = 20) {
  const initialPresentRef = React.useRef(initialPresent);

  const reducerWrapper = React.useCallback(
    (state: HistoryState<T>, action: Action<T>) => {
      return useHistoryStateReducer(state, action, maxHistorySize);
    },
    [maxHistorySize]
  );

  const [state, dispatch] = React.useReducer(
    reducerWrapper,
    initialUseHistoryState(initialPresentRef.current)
  );

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = React.useCallback(() => {
    if (canUndo) dispatch({ type: "UNDO" });
  }, [canUndo]);

  const redo = React.useCallback(() => {
    if (canRedo) dispatch({ type: "REDO" });
  }, [canRedo]);

  const set = React.useCallback(
    (newPresent: T) => dispatch({ type: "SET", newPresent }),
    []
  );

  const clear = React.useCallback(
    () =>
      dispatch({ type: "CLEAR", initialPresent: initialPresentRef.current }),
    []
  );

  return {
    presentState: state.present,
    setPresent: set,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
}
