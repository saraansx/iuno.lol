"use client";

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
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
        setTimeout(() => setOverrides({}), 0);
      }
    } else {
      hasMounted.current = true;
    }
  }, [initialUser]);

  const updateOverrides = (newOverrides: Partial<FullUser>) => {
    setOverrides((prev) => {
      const next = { ...prev, ...newOverrides };
      (Object.keys(next) as Array<keyof Partial<FullUser>>).forEach((key) => {
        if (next[key] === undefined) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const clearOverrides = () => {
    setOverrides({});
  };

  const scheduleClear = () => {
    pendingClearRef.current = true;
  };

  const setPendingFile = (type: "avatar" | "background" | "banner", file?: File) => {
    setPendingFiles((prev) => ({ ...prev, [type]: file }));
  };

  const clearPendingFiles = () => {
    setPendingFiles({});
  };

  return (
    <CustomizeProfileContext.Provider value={{ 
      initialUser, 
      overrides, 
      updateOverrides, 
      clearOverrides, 
      scheduleClear,
      pendingFiles,
      setPendingFile,
      clearPendingFiles
    }}>
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
