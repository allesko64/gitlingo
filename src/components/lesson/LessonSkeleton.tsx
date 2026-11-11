import { Grid } from "../layout/Grid";

export function LessonSkeleton() {
  return (
    <Grid aria-hidden="true" className="lesson-layout">
      <div className="lesson-column col-span-12 flex flex-col gap-4 xl:col-span-6">
        <span className="h-3 w-24 rounded-[4px] bg-white/10" />
        <span className="h-12 w-3/4 rounded-ui bg-white/10" />
        <span className="h-16 w-full rounded-ui bg-white/5" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-16 w-full rounded-ui border border-white/10" />
        ))}
      </div>
      <div className="lesson-column col-span-12 flex flex-col gap-4 xl:col-span-6">
        <span className="h-64 w-full flex-[3] rounded-card border border-white/10 bg-white/5" />
        <span className="h-32 w-full flex-[2] rounded-card border border-white/10 bg-white/5" />

      </div>
    </Grid>
  );
}
