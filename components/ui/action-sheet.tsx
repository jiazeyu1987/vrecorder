"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface ActionSheetContextValue {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ActionSheetContext = React.createContext<ActionSheetContextValue | null>(null)

function useActionSheet() {
  const context = React.useContext(ActionSheetContext)
  if (!context) {
    throw new Error("useActionSheet must be used within an ActionSheet")
  }
  return context
}

function ActionSheet({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setIsOpen(newOpen)
      }
    },
    [onOpenChange]
  )

  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : isOpen

  return (
    <ActionSheetContext.Provider
      value={{
        isOpen: currentOpen,
        onOpenChange: handleOpenChange,
      }}
    >
      <DialogPrimitive.Root open={currentOpen} onOpenChange={handleOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </ActionSheetContext.Provider>
  )
}

function ActionSheetTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="action-sheet-trigger"
      className={className}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  )
}

function ActionSheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const isMobile = useIsMobile()

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogPrimitive.Content
        data-slot="action-sheet-content"
        className={cn(
          "fixed z-50 grid w-full gap-4 bg-white/95 backdrop-blur-xl shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          isMobile
            ? "inset-x-4 bottom-4 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom rounded-2xl p-1"
            : "left-1/2 top-1/2 max-w-lg translate-x-[-50%] translate-y-[-50%] data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl p-2",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function ActionSheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()
  
  return (
    <div
      data-slot="action-sheet-header"
      className={cn(
        "flex flex-col space-y-1.5 text-center",
        isMobile ? "p-4 pb-2" : "p-6 pb-4",
        className
      )}
      {...props}
    />
  )
}

function ActionSheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()
  
  return (
    <div
      data-slot="action-sheet-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        isMobile ? "p-4 pt-2" : "p-6 pt-4",
        className
      )}
      {...props}
    />
  )
}

function ActionSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="action-sheet-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-800",
        className
      )}
      {...props}
    />
  )
}

function ActionSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="action-sheet-description"
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
}

function ActionSheetClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="action-sheet-close"
      className={cn(
        "absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )
}

interface ActionSheetItemProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive"
  icon?: React.ReactNode
}

function ActionSheetItem({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: ActionSheetItemProps) {
  const isMobile = useIsMobile()
  
  return (
    <button
      data-slot="action-sheet-item"
      data-variant={variant}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl text-left transition-all duration-200 transform active:scale-95 outline-none focus:ring-4 focus:ring-primary/20",
        isMobile ? "px-6 py-4 text-base" : "px-4 py-3 text-sm",
        variant === "default"
          ? "text-gray-800 hover:bg-gray-100/80 active:bg-gray-200/60"
          : "text-red-600 hover:bg-red-50 active:bg-red-100",
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn("flex-shrink-0", isMobile ? "text-lg" : "text-base")}>
          {icon}
        </span>
      )}
      <span className="flex-1 font-medium">{children}</span>
    </button>
  )
}

function ActionSheetSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()
  
  return (
    <div
      data-slot="action-sheet-separator"
      className={cn(
        "bg-gray-200/60",
        isMobile ? "-mx-1 my-1 h-px" : "-mx-2 my-2 h-px",
        className
      )}
      {...props}
    />
  )
}

function ActionSheetCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  const isMobile = useIsMobile()
  
  return (
    <DialogPrimitive.Close
      data-slot="action-sheet-cancel"
      className={cn(
        "flex w-full items-center justify-center rounded-xl font-medium transition-all duration-200 transform active:scale-95 outline-none focus:ring-4 focus:ring-primary/20 bg-gray-100/60 text-gray-700 hover:bg-gray-200/80 active:bg-gray-300/60",
        isMobile ? "mt-2 px-6 py-4 text-base" : "mt-4 px-4 py-3 text-sm",
        className
      )}
      {...props}
    >
      {children || "取消"}
    </DialogPrimitive.Close>
  )
}

export {
  ActionSheet,
  ActionSheetTrigger,
  ActionSheetContent,
  ActionSheetHeader,
  ActionSheetFooter,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetClose,
  ActionSheetItem,
  ActionSheetSeparator,
  ActionSheetCancel,
}
