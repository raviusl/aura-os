"use client";

import * as React from "react";
import { UploadIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  hint = "Drag and drop, or browse",
  onFilesChange,
  ...props
}: UploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    onFilesChange?.(files);
  };

  return (
    <div
      data-slot="uploader"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      className={cn(
        "flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        dragging && "border-ring bg-muted/50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        handleFiles(event.dataTransfer.files);
      }}
      {...props}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
        <UploadIcon className="size-4" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Browse
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}

export { Uploader };
export type { UploaderProps };
