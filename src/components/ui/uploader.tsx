"use client";

import * as React from "react";
import { UploadIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type UploaderProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  onFilesChange?: (files: FileList | null) => void;
};

function Uploader({
  className,
  accept,
  multiple = false,
  disabled = false,
  label = "Upload files",
  hint = "Drag and drop, or click to browse",
  onFilesChange,
  ...props
}: UploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  return (
    <div
      data-slot="uploader"
      className={cn(
        "flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors",
        dragging && "border-ring bg-muted/50",
        disabled ? "opacity-50" : "cursor-pointer",
        className,
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        onFilesChange?.(event.dataTransfer.files);
      }}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => onFilesChange?.(event.target.files)}
      />
      <button
        type="button"
        disabled={disabled}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => inputRef.current?.click()}
      >
        <span
          className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground"
          style={{ boxShadow: "var(--shadow-sm)" }}
          aria-hidden
        >
          <UploadIcon className="size-4" />
        </span>
        <span className="space-y-1">
          <span className="block text-sm font-medium text-foreground">
            {label}
          </span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
      </button>
    </div>
  );
}

export { Uploader };
export type { UploaderProps };
