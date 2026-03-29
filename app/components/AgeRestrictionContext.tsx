"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const SESSION_KEY = "cleanshelf_age_verified_18";

type ConfirmArgs = {
  productName?: string;
};

type ContextValue = {
  confirmAgeRestrictedAdd: (args?: ConfirmArgs) => Promise<boolean>;
};

const AgeRestrictionContext = createContext<ContextValue | null>(null);

type PendingRequest = {
  productName?: string;
};

export function AgeRestrictionProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const resolversRef = useRef<Array<(accepted: boolean) => void>>([]);

  useEffect(() => {
    try {
      setVerified(window.sessionStorage.getItem(SESSION_KEY) === "true");
    } catch {
      setVerified(false);
    }
  }, []);

  useEffect(() => {
    if (!pending) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pending]);

  const resolvePending = useCallback((accepted: boolean) => {
    const resolvers = [...resolversRef.current];
    resolversRef.current = [];
    resolvers.forEach((resolve) => resolve(accepted));
    setPending(null);
  }, []);

  const confirmAgeRestrictedAdd = useCallback((args?: ConfirmArgs) => {
    if (verified) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
      resolversRef.current.push(resolve);
      setPending((current) => current || { productName: args?.productName });
    });
  }, [verified]);

  const accept = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Ignore storage errors and continue with current session state.
    }
    setVerified(true);
    resolvePending(true);
  }, [resolvePending]);

  const decline = useCallback(() => {
    resolvePending(false);
  }, [resolvePending]);

  const value = useMemo<ContextValue>(() => ({
    confirmAgeRestrictedAdd,
  }), [confirmAgeRestrictedAdd]);

  const modal = pending ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-restriction-title"
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/55 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Age restricted</p>
        <h2 id="age-restriction-title" className="text-xl font-semibold text-slate-900">
          Confirm that you are 18+
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {pending.productName
            ? `"${pending.productName}" is restricted to customers aged 18 and above.`
            : "This product is restricted to customers aged 18 and above."}{" "}
          Please confirm your age to continue.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={accept}
            className="flex-1 rounded-xl bg-[#7A8E3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#687a31]"
          >
            I am 18 or older
          </button>
          <button
            type="button"
            onClick={decline}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <AgeRestrictionContext.Provider value={value}>
      {children}
      {modal && typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </AgeRestrictionContext.Provider>
  );
}

export function useAgeRestrictionGate(): ContextValue {
  const value = useContext(AgeRestrictionContext);
  if (!value) {
    throw new Error("useAgeRestrictionGate must be used within AgeRestrictionProvider");
  }
  return value;
}
