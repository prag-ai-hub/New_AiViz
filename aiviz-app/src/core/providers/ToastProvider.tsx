import { ReactNode } from "react";
import Toast from "react-native-toast-message";

/** Mounts the root <Toast /> portal. Use `showToast.*` (sibling file) to dispatch. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toast position="bottom" bottomOffset={80} />
    </>
  );
}

type Args = { title: string; message?: string };

export const showToast = {
  success({ title, message }: Args) {
    Toast.show({ type: "success", text1: title, text2: message });
  },
  error({ title, message }: Args) {
    Toast.show({ type: "error", text1: title, text2: message });
  },
  info({ title, message }: Args) {
    Toast.show({ type: "info", text1: title, text2: message });
  },
};

export function useToast() {
  return showToast;
}
