import { type ReactNode } from "react";
import { useCall } from "../../hooks/useCall";
import { CallContext } from "./callContext";

export function CallProvider({
  currentUserId,
  otherUserId,
  children,
}: {
  currentUserId: string | null;
  otherUserId: string | null;
  children: ReactNode;
}) {
  const call = useCall(currentUserId, otherUserId);
  return <CallContext.Provider value={call}>{children}</CallContext.Provider>;
}
