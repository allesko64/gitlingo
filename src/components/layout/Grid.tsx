import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLElement> & { as?: "div" | "ol" | "section" };

export function Grid({ as: Tag = "div", className, ...props }: Props) {
  return <Tag className={cn("layout-grid", className)} {...props} />;
}
