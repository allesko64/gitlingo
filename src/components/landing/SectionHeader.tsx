type Props = {
  id: string;
  label: string;
  title: string;
  sub: string;
  as?: "h1" | "h2";
  /** Landing sections stay centered; list pages align with the card grid. */
  align?: "center" | "start";
};

export function SectionHeader({ id, label, title, sub, as: Heading = "h2", align = "center" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-heading text-center" : "max-w-heading text-left"}>
      <p className="font-pixel text-xs tracking-wide text-white/50">{label}</p>
      <Heading
        id={id}
        className="mt-4 text-balance text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-white lg:text-[44px]"
      >
        {title}
      </Heading>
      <p className="mt-4 text-base text-white/70 sm:text-lg">{sub}</p>
    </div>
  );
}
