"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
  CircleCheckIcon,
  CircleXIcon,
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
        "pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 w-auto max-w-sm outline-none select-none",
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
        "pointer-events-auto flex items-center justify-between gap-2.5 pl-3.5 pr-2.5 py-2.5 rounded-xl bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/[0.08] text-white w-[340px] max-w-[90vw] select-none shadow-[0_12px_40px_rgba(0,0,0,0.55)]",
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
      className={cn("text-[13px] font-normal tracking-tight text-white/85 leading-snug", className)}
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
      className={cn("text-[12px] font-light text-white/40 leading-relaxed", className)}
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
        "shrink-0 self-center text-white/25 hover:text-white/70 transition-colors cursor-pointer rounded-md p-1",
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="size-3.5" aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type === "success") {
    return (
      <span data-slot="toast-icon" className="shrink-0 self-center text-emerald-400/90">
        <CircleCheckIcon className="size-4" aria-hidden="true" />
      </span>
    );
  }

  if (type === "error") {
    return (
      <span data-slot="toast-icon" className="shrink-0 self-center text-red-400/90">
        <CircleXIcon className="size-4" aria-hidden="true" />
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
  timeout = 4000,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} timeout={timeout} {...props}>
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
