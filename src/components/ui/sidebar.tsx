"use client";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  openWidth,
  ...props
}: React.ComponentProps<typeof motion.div> & { openWidth?: number }) => {
  return (
    <>
      <DesktopSidebar openWidth={openWidth} {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  openWidth = 260,
  ...props
}: React.ComponentProps<typeof motion.div> & { openWidth?: number }) => {
  const { open, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full hidden md:flex md:flex-col bg-transparent w-[260px] shrink-0",
          className
        )}
        initial={false}
        animate={{
          width: animate ? (open ? `${openWidth}px` : "60px") : "260px",
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({ children }: React.ComponentProps<"div">) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between gap-3 h-14 px-4 bg-[#050505] border-b border-white/[0.06] shrink-0">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <Image src="/Favicon.png" alt="Iuno Logo" width={512} height={512} className="w-6 h-auto object-contain shrink-0" />
          <span className="font-normal text-white tracking-tight text-lg" style={{ fontFamily: "var(--font-comfortaa)" }}>
            Iuno<span className="text-[#5b6cf5] lowercase">.lol</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="p-2 -mr-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-[90] bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-[100] h-full w-[82%] max-w-[300px] bg-[#0a0a0a] border-r border-white/[0.08] md:hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 z-10 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div
                className="h-full flex flex-col"
                onClickCapture={(e) => {
                  if ((e.target as Element).closest("a")) setOpen(false);
                }}
              >
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

