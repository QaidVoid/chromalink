import { writable } from "svelte/store";

export type HistoryAction = {
  type: "draw" | "erase";
  pixels: { x: number; y: number; color?: string }[];
  previousState: { x: number; y: number; color?: string }[];
  timestamp: number;
};

function createHistoryStore() {
  const { subscribe, set, update } = writable<{
    undoStack: HistoryAction[];
    redoStack: HistoryAction[];
  }>({
    undoStack: [],
    redoStack: [],
  });

  return {
    subscribe,
    addAction: (action: HistoryAction) => {
      update((state) => ({
        undoStack: [...state.undoStack, action],
        redoStack: [], // Clear redo stack when new action is added
      }));
    },
    undo: (): HistoryAction | null => {
      let action: HistoryAction | null = null;
      update((state) => {
        if (state.undoStack.length === 0) return state;

        const newUndoStack = [...state.undoStack];
        action = newUndoStack.pop()!;

        return {
          undoStack: newUndoStack,
          redoStack: [...state.redoStack, action],
        };
      });
      return action;
    },
    redo: (): HistoryAction | null => {
      let action: HistoryAction | null = null;
      update((state) => {
        if (state.redoStack.length === 0) return state;

        const newRedoStack = [...state.redoStack];
        action = newRedoStack.pop()!;

        return {
          undoStack: [...state.undoStack, action],
          redoStack: newRedoStack,
        };
      });
      return action;
    },
    canUndo: (state: { undoStack: HistoryAction[]; redoStack: HistoryAction[] }) =>
      state.undoStack.length > 0,
    canRedo: (state: { undoStack: HistoryAction[]; redoStack: HistoryAction[] }) =>
      state.redoStack.length > 0,
    clear: () => {
      set({ undoStack: [], redoStack: [] });
    },
  };
}

export const history = createHistoryStore();
