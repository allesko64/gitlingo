import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GLASS } from "./glass";

type Common = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "nav";
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

type LinkButton = Common & { href: string; onClick?: () => void; disabled?: never; type?: never };

type ActionButton = Common & {
  href?: never;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

type Props = LinkButton | ActionButton;

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ui px-5 text-base font-medium transition duration-150 ease-out motion-reduce:transition-none";

const SIZES = {
  md: "h-12",
  nav: "h-10",
};

const VARIANTS = {
  primary: "bg-pink text-navy",
  secondary: `${GLASS} text-white`,
};

const ENABLED = {
  primary: "hover:-translate-y-px hover:brightness-110 active:translate-y-px active:brightness-100 motion-reduce:hover:translate-y-0",
  secondary: "hover:-translate-y-px hover:bg-white/15 active:translate-y-px motion-reduce:hover:translate-y-0",
};

const DISABLED = "cursor-not-allowed text-white/30";

export function Button(props: Props) {
  const { children, variant = "primary", size = "md", icon, className, ariaLabel } = props;
  const disabled = "disabled" in props && props.disabled === true;
  const ring = variant === "primary" ? "white" : undefined;

  const classes = cn(
    BASE,
    SIZES[size],
    VARIANTS[variant],
    disabled ? DISABLED : ENABLED[variant],
    disabled && variant === "primary" && "bg-white/10",
    className,
  );

  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (props.href !== undefined) {
    if (props.href.startsWith("#")) {
      return (
        <a href={props.href} onClick={props.onClick} aria-label={ariaLabel} className={classes} data-ring={ring}>
          {content}
        </a>
      );
    }
    return (
      <Link href={props.href} onClick={props.onClick} aria-label={ariaLabel} className={classes} data-ring={ring}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
      data-ring={ring}
    >
      {content}
    </button>
  );
}
