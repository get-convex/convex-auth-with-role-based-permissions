import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function Message({
  author,
  authorName,
  viewer,
  messageId,
  onDelete,
  showDelete,
  children,
}: {
  author: Id<"users">;
  authorName: string;
  viewer: Id<"users">;
  messageId: Id<"messages">;
  onDelete?: (messageId: Id<"messages">) => void;
  showDelete?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex flex-col text-sm",
        author === viewer ? "items-end self-end" : "items-start self-start",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium">{authorName}</span>
        {showDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete?.(messageId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p
        className={cn(
          "rounded-xl bg-muted px-3 py-2",
          author === viewer ? "rounded-tr-none" : "rounded-tl-none",
        )}
      >
        {children}
      </p>
    </li>
  );
}
