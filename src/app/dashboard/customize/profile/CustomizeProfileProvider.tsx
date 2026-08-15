"use client";

import { createContext, useContext, useState, ReactNode, useRef, useEffect, useMemo, useCallback } from "react";
import { type FullUser } from "@/lib/features/users/db";

type CustomizeProfileContextType = {
  initialUser: FullUser | null;
  overrides: Partial<FullUser>;
  updateOverrides: (newOverrides: Partial<FullUser>) => void;
  clearOverrides: () => void;
  scheduleClear: () => void;
  pendingFiles: { avatar?: File; background?: File; banner?: File };
  setPendingFile: (type: "avatar" | "background" | "banner", file?: File) => void;
  clearPendingFiles: () => void;
};

const CustomizeProfileContext = createContext<CustomizeProfileContextType | undefined>(undefined);

export function CustomizeProfileProvider({
  initialUser,
  children,
}: {
  initialUser: FullUser | null;
  children: ReactNode;
}) {
  const [overrides, setOverrides] = useState<Partial<FullUser>>({});
  const [pendingFiles, setPendingFiles] = useState<{ avatar?: File; background?: File; banner?: File }>({});
  const pendingClearRef = useRef(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) {
      if (pendingClearRef.current) {
        pendingClearRef.current = false;
        // Queue clear on next frame to prevent sync render cascades
        requestAnimationFrame(() => setOverrides({}));
      }
    } else {
      hasMounted.current = true;
    }
  }, [initialUser]);

  const updateOverrides = useCallback((newOverrides: Partial<FullUser>) => {
    setOverrides((prev) => {
      const next = { ...prev, ...newOverrides };
      (Object.keys(next) as Array<keyof Partial<FullUser>>).forEach((key) => {
        if (next[key] === undefined) {
          delete next[key];
        }
      });
      return next;
    });
  }, []);

  const clearOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  const scheduleClear = useCallback(() => {
    pendingClearRef.current = true;
  }, []);

  const setPendingFile = useCallback((type: "avatar" | "background" | "banner", file?: File) => {
    setPendingFiles((prev) => ({ ...prev, [type]: file }));
  }, []);

  const clearPendingFiles = useCallback(() => {
    setPendingFiles({});
  }, []);

  const value = useMemo(
    () => ({
      initialUser,
      overrides,
      updateOverrides,
      clearOverrides,
      scheduleClear,
      pendingFiles,
      setPendingFile,
      clearPendingFiles,
    }),
    [
      initialUser,
      overrides,
      updateOverrides,
      clearOverrides,
      scheduleClear,
      pendingFiles,
      setPendingFile,
      clearPendingFiles,
    ]
  );

  return (
    <CustomizeProfileContext.Provider value={value}>
      {children}
    </CustomizeProfileContext.Provider>
  );
}

export function useCustomizeProfile() {
  const context = useContext(CustomizeProfileContext);
  if (!context) {
    throw new Error("useCustomizeProfile must be used within a CustomizeProfileProvider");
  }
  return context;
}
