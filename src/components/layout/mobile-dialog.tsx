"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function MobileDialog({
  id,
  label,
  open,
  desktopWidth,
  onClose,
  className,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  desktopWidth: string;
  onClose: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    const desktop = window.matchMedia(`(min-width: ${desktopWidth})`);
    if (desktop.matches) {
      onClose();
      return;
    }

    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) onClose();
    }

    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open, desktopWidth, onClose]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-label={label}
      className={cn("fixed m-0 max-w-none p-0 text-ink backdrop:bg-black/45", className)}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
