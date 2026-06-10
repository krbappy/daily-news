import { createContext, useContext } from "react";
import type { CallApi } from "../../hooks/useCall";

export const CallContext = createContext<CallApi | null>(null);

export function useCallContext(): CallApi {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used within a CallProvider");
  return ctx;
}
