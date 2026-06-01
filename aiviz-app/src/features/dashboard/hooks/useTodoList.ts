import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Todo = { id: string; text: string; done: boolean };

type State = {
  items: Todo[];
  add: (text: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

export const useTodoList = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (text) =>
        set((s) => ({
          items: [
            ...s.items,
            { id: Math.random().toString(36).slice(2), text, done: false },
          ],
        })),
      toggle: (id) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          ),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
    }),
    {
      name: "aiviz.todo",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
