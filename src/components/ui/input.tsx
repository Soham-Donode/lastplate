import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-control border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/15 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70";

const largeField =
  "h-12 rounded-[10px] border-transparent bg-surface px-4 text-[14px] focus:bg-paper";

export function Input({
  className,
  fieldSize = "md",
  ...props
}: React.ComponentProps<"input"> & { fieldSize?: "md" | "lg" }) {
  return (
    <input
      className={cn(
        controlBase,
        fieldSize === "lg" ? largeField : "h-10",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  fieldSize = "md",
  ...props
}: React.ComponentProps<"textarea"> & { fieldSize?: "md" | "lg" }) {
  return (
    <textarea
      className={cn(
        controlBase,
        fieldSize === "lg"
          ? "min-h-24 rounded-[10px] border-transparent bg-surface px-4 py-3 text-[14px] leading-6 focus:bg-paper"
          : "min-h-24 py-2.5 leading-6",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(controlBase, "h-10 appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink"
        >
          {label}
          {optional && (
            <span className="ml-1.5 font-normal text-muted">optional</span>
          )}
        </label>
      </div>
      {children}
      {error ? (
        <p className="text-[12px] leading-5 text-ink-soft" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-5 text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
