import {
  Copy,
  Edit,
  Eye,
  Grid3X3,
  Link,
  Move,
  Palette,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { FC } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
  disabled?: boolean;
  category?: string;
}

interface CommandPaletteProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
  actions: ActionMenuItem[];
}

export const CommandPalette: FC<CommandPaletteProps> = ({
  className,
  isOpen,
  onClose,
  onAction,
  actions,
}) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const handleAction = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  const groupedActions = actions.reduce(
    (acc, action) => {
      const category = action.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    },
    {} as Record<string, ActionMenuItem[]>,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl p-0 gap-0 z-50",
          "bg-background border shadow-lg",
          className,
        )}
      >
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Command Palette
          </DialogTitle>
        </DialogHeader>

        <Command className="rounded-none border-none">
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-96">
            <CommandEmpty>No results found.</CommandEmpty>

            {Object.entries(groupedActions).map(
              ([category, categoryActions]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={`${action.label} ${action.category}`}
                      onSelect={() => handleAction(action.id)}
                      disabled={action.disabled}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        action.disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {action.icon && (
                        <span className="flex-shrink-0">{action.icon}</span>
                      )}
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {action.shortcut}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ),
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

interface ContextActionMenuProps {
  className?: string;
  children: React.ReactNode;
  items: ActionMenuItem[];
  onAction: (actionId: string) => void;
}

export const ContextActionMenu: FC<ContextActionMenuProps> = ({
  className,
  children,
  items,
  onAction,
}) => {
  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ActionMenuItem[]>,
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {Object.entries(groupedItems).map(
          ([category, categoryItems], categoryIndex) => (
            <div key={category}>
              {categoryIndex > 0 && <ContextMenuSeparator />}
              {categoryItems.map((item, itemIndex) => (
                <ContextMenuItem
                  key={item.id}
                  onClick={() => onAction(item.id)}
                  disabled={item.disabled}
                  className="flex items-center gap-2"
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {item.shortcut}
                    </span>
                  )}
                </ContextMenuItem>
              ))}
            </div>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

interface FloatingActionButtonProps {
  className?: string;
  onClick: () => void;
  icon?: React.ReactNode;
  tooltip?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  className,
  onClick,
  icon = <Plus className="h-4 w-4" />,
  tooltip,
  variant = "default",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size="icon"
      className={cn(
        "fixed bottom-6 right-60 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground",
        "border-2 border-primary/20 dark:border-primary/30",
        "backdrop-blur-sm hover:scale-105 active:scale-95",
        sizeClasses[size],
        className,
      )}
      title={tooltip}
    >
      {icon}
    </Button>
  );
};

interface ActionToolbarProps {
  className?: string;
  actions: ActionMenuItem[];
  onAction: (actionId: string) => void;
  orientation?: "horizontal" | "vertical";
}

export const ActionToolbar: FC<ActionToolbarProps> = ({
  className,
  actions,
  onAction,
  orientation = "horizontal",
}) => {
  return (
    <div
      className={cn(
        "flex gap-1 p-3 shadow-lg border backdrop-blur-sm",
        "bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600",
        "transition-all duration-200 hover:shadow-xl rounded-lg",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
    >
      {/* Toolbar Header */}
      <div
        className={cn(
          "flex items-center gap-2 mb-2",
          orientation === "vertical" ? "flex-row" : "hidden sm:flex",
        )}
      >
        <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Family Tree
        </span>
      </div>

      {/* Action Buttons */}
      <div
        className={cn(
          "flex gap-1",
          orientation === "vertical" ? "flex-col" : "flex-row flex-nowrap",
        )}
      >
        {actions.map((action, index) => (
          <div key={action.id} className="flex-shrink-0">
            {index > 0 && action.category !== actions[index - 1]?.category && (
              <div
                className={cn(
                  "bg-border dark:bg-gray-600",
                  orientation === "vertical"
                    ? "h-px w-full my-1"
                    : "w-px h-6 mx-1",
                )}
              />
            )}
            <Button
              onClick={() => onAction(action.id)}
              variant="ghost"
              size="sm"
              disabled={action.disabled}
              className={cn(
                "flex items-center gap-2 h-8",
                "hover:bg-primary/10 dark:hover:bg-primary/20",
                "text-gray-700 dark:text-gray-300",
                "border-transparent hover:border-primary/20 dark:hover:border-primary/30",
                action.disabled && "opacity-50 cursor-not-allowed",
              )}
              title={
                action.label + (action.shortcut ? ` (${action.shortcut})` : "")
              }
            >
              {action.icon}
              <span className="hidden sm:inline text-xs whitespace-nowrap">
                {action.label}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pre-defined action sets for common operations
export const getPersonActions = (personId?: string): ActionMenuItem[] => [
  {
    id: "add-person",
    label: "Add Person",
    icon: <Users className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+N",
    category: "Create",
  },
  {
    id: "edit-person",
    label: "Edit Person",
    icon: <Edit className="h-4 w-4" />,
    action: () => {},
    shortcut: "Enter",
    disabled: !personId,
    category: "Edit",
  },
  {
    id: "delete-person",
    label: "Delete Person",
    icon: <Trash2 className="h-4 w-4" />,
    action: () => {},
    shortcut: "Delete",
    disabled: !personId,
    category: "Edit",
  },
  {
    id: "add-relationship",
    label: "Add Relationship",
    icon: <Link className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+R",
    disabled: !personId,
    category: "Create",
  },
  {
    id: "copy-person",
    label: "Copy Person",
    icon: <Copy className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+C",
    disabled: !personId,
    category: "Edit",
  },
];

export const getCanvasActions = (): ActionMenuItem[] => [
  {
    id: "pan-mode",
    label: "Pan Mode",
    icon: <Move className="h-4 w-4" />,
    action: () => {},
    shortcut: "Space",
    category: "Navigation",
  },
  {
    id: "zoom-in",
    label: "Zoom In",
    icon: <Plus className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl++",
    category: "Navigation",
  },
  {
    id: "zoom-out",
    label: "Zoom Out",
    icon: <X className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+-",
    category: "Navigation",
  },
  {
    id: "fit-canvas",
    label: "Fit to Screen",
    icon: <Eye className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+0",
    category: "Navigation",
  },
  {
    id: "canvas-settings",
    label: "Canvas Settings",
    icon: <Settings className="h-4 w-4" />,
    action: () => {},
    category: "Settings",
  },
  {
    id: "toggle-grid-coordinates",
    label: "Toggle Grid Coordinates",
    icon: <Grid3X3 className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+G",
    category: "View",
  },
  {
    id: "center-nodes",
    label: "Center All Nodes",
    icon: <Move className="h-4 w-4" />,
    action: () => {},
    shortcut: "Ctrl+Shift+C",
    category: "Layout",
  },
  {
    id: "theme-settings",
    label: "Theme Settings",
    icon: <Palette className="h-4 w-4" />,
    action: () => {},
    category: "Settings",
  },
];

// Notebook-style action hooks
export const useNotebookActions = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openCommandPalette: () => setCommandPaletteOpen(true),
    closeCommandPalette: () => setCommandPaletteOpen(false),
  };
};
