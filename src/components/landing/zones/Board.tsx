import type { ReactNode, Ref } from "react";
import { copy } from "@/lib/landing/copy";
import { FILE_IDS, type Commit, type Step, type ZoneName, type ZoneState } from "@/lib/landing/fourZonesScript";
import { Grid } from "../../layout/Grid";
import { CommitNode } from "./CommitNode";
import { Bracket, Connector, SyncConnector } from "./Connectors";
import { FileChip } from "./FileChip";
import { ZoneCard } from "./ZoneCard";
import { ZoneIcon } from "./ZoneIcons";

type Props = {
  state: ZoneState;
  activeArrow: Step["activeArrow"];
  hidden?: ReadonlySet<string>;
  popping?: ReadonlySet<string>;
  highlight?: ReadonlySet<ZoneName>;
  flash?: string | null;
  boardRef?: Ref<HTMLDivElement>;
  overlay?: ReactNode;
};


const zones = copy.fourZones.zones;

function Empty() {
  return <p className="text-sm text-white/50">{copy.fourZones.empty}</p>;
}

export function Board({
  state,
  activeArrow,
  hidden,
  popping,
  highlight,
  flash = null,
  boardRef,
  overlay,
}: Props) {
  const zoneCard = (zone: ZoneName, children: ReactNode, connector?: ReactNode) => (
    <div className="relative col-span-12 min-w-0 lg:col-span-3">
      <ZoneCard
        zone={zone}
        icon={<ZoneIcon zone={zone} className="size-8 shrink-0" />}
        title={zones[zone].title}
        description={zones[zone].line}
        highlighted={highlight?.has(zone) ?? false}
        className="min-w-0 p-6 lg:h-full lg:p-6"
      >
        {children}
      </ZoneCard>
      {connector && (
        <div className="mt-4 lg:absolute lg:inset-y-0 lg:left-[calc(100%+var(--grid-gap)/2)] lg:mt-0 lg:w-[var(--grid-gap)] lg:-translate-x-1/2 lg:[&>div]:h-full lg:[&>div]:w-full">
          {connector}
        </div>
      )}
    </div>
  );

  const commits = (zone: "local" | "remote", list: Commit[]) =>
    list.length === 0 ? (
      <Empty />
    ) : (
      <ol aria-label={`Snapshots in ${zones[zone].title}`} className="flex flex-wrap items-start gap-2">
        {list.map((commit) => {
          const key = `${zone}:${commit.hash}`;
          return (
            <CommitNode
              key={key}
              flyKey={key}
              commit={commit}
              place={zones[zone].title}
              hidden={hidden?.has(key)}
              popping={popping?.has(key)}
            />
          );
        })}
      </ol>
    );

  return (
    <div ref={boardRef} className="relative">
      <div aria-hidden="true" className="mb-3 hidden lg:block">
        <Grid>
          <div className="relative col-span-9">
            <Bracket label={copy.fourZones.onYourComputer} />
            <span className="absolute inset-y-0 left-[calc(100%+var(--grid-gap)/2)] border-l border-dashed border-white/20" />
          </div>
          <Bracket label={copy.fourZones.online} className="col-span-3" />
        </Grid>
      </div>
      <p aria-hidden="true" className="mb-3 font-pixel text-[10px] tracking-wide text-white/50 lg:hidden">
        {copy.fourZones.onYourComputer}
      </p>

      <Grid>
        {zoneCard(
          "working",
          <ul aria-label={`Files in ${zones.working.title}`} className="flex flex-wrap gap-2 lg:flex-col">
            {FILE_IDS.map((file) => {
              const key = `working:${file}`;
              return (
                <FileChip
                  key={key}
                  flyKey={key}
                  name={file}
                  status={flash === key ? "updated" : state.working[file]}
                  place={zones.working.title}
                />
              );
            })}
          </ul>,
          <Connector label="add" active={activeArrow === "add"} />,
        )}
        {zoneCard(
          "staging",
          state.staging.length === 0 ? (
            <Empty />
          ) : (
            <ul aria-label={`Files in ${zones.staging.title}`} className="flex flex-wrap gap-2 lg:flex-col">
              {state.staging.map((file) => {
                const key = `staging:${file}`;
                return (
                  <FileChip
                    key={key}
                    flyKey={key}
                    name={file}
                    status="staged"
                    place={zones.staging.title}
                    hidden={hidden?.has(key)}
                  />
                );
              })}
            </ul>
          ),
          <Connector label="commit" active={activeArrow === "commit"} />,
        )}
        {zoneCard(
          "local",
          commits("local", state.local),
          <SyncConnector
            pushActive={activeArrow === "push"}
            pullActive={activeArrow === "pull"}
            onlineLabel={copy.fourZones.online}
          />,
        )}
        {zoneCard("remote", commits("remote", state.remote))}
      </Grid>

      {overlay}
    </div>
  );
}
