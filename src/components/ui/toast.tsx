"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
  CircleCheckIcon,
  OctagonXIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const baseToastManager = ToastPrimitive.createToastManager();

export const toast = Object.assign(baseToastManager, {
  success: (title: React.ReactNode, description?: React.ReactNode) => {
    return baseToastManager.add({
      type: "success",
      title: typeof title === "string" ? title : undefined,
      description: description || (typeof title !== "string" ? title : undefined),
    });
  },
  error: (title: React.ReactNode, description?: React.ReactNode) => {
    return baseToastManager.add({
      type: "error",
      title: typeof title === "string" ? title : undefined,
      description: description || (typeof title !== "string" ? title : undefined),
    });
  },
});

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 w-auto max-w-sm outline-none select-none",
        className
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-[#222226] border border-white/10 text-white shadow-2xl backdrop-blur-xl w-[350px] max-w-[90vw] select-none transition-all duration-300 animate-in fade-in slide-in-from-top-3",
        className
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex w-full items-center gap-3", className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-[13.5px] font-normal tracking-[0.2px] text-white/90", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-[12px] text-zinc-400", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      className={cn(
        "shrink-0 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-md p-1",
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="size-4" aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type === "success") {
    return (
      <span data-slot="toast-icon" className="shrink-0 text-emerald-400">
        <CircleCheckIcon className="size-4" aria-hidden="true" />
      </span>
    );
  }

  if (type === "error") {
    return (
      <span data-slot="toast-icon" className="shrink-0 text-red-400">
        <OctagonXIcon className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return null;
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toastItem) => (
        <motion.div
          key={toastItem.id}
          layout
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          <Toast toast={toastItem}>
            <ToastContent>
              <ToastIcon type={toastItem.type} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <ToastTitle />
                <ToastDescription />
              </div>
              <ToastClose />
            </ToastContent>
          </Toast>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
};
