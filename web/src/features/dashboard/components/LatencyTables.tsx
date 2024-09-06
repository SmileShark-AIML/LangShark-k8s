import { RightAlignedCell } from "@/src/features/dashboard/components/RightAlignedCell";
import { DashboardCard } from "@/src/features/dashboard/components/cards/DashboardCard";
import { DashboardTable } from "@/src/features/dashboard/components/cards/DashboardTable";
import { type FilterState } from "@langfuse/shared";
import { api } from "@/src/utils/api";

import { type DatabaseRow } from "@/src/server/api/services/query-builder";
import { formatIntervalSeconds } from "@/src/utils/dates";
import { createTracesTimeFilter } from "@/src/features/dashboard/lib/dashboard-utils";
import { truncate } from "@/src/utils/string";
import { Popup } from "@/src/components/layouts/doc-popup";

export const LatencyTables = ({
  projectId,
  globalFilterState,
}: {
  projectId: string;
  globalFilterState: FilterState;
}) => {
  const generationsLatencies = api.dashboard.chart.useQuery(
    {
      projectId,
      from: "traces_observations",
      select: [
        { column: "duration", agg: "50thPercentile" },
        { column: "duration", agg: "90thPercentile" },
        { column: "duration", agg: "95thPercentile" },
        { column: "duration", agg: "99thPercentile" },
        { column: "name" },
      ],
      filter: [
        ...globalFilterState,
        {
          type: "string",
          column: "type",
          operator: "=",
          value: "GENERATION",
        },
      ],
      groupBy: [{ type: "string", column: "name" }],
      orderBy: [
        { column: "duration", agg: "95thPercentile", direction: "DESC" },
      ],
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );

  const spansLatencies = api.dashboard.chart.useQuery(
    {
      projectId,
      from: "traces_observations",
      select: [
        { column: "duration", agg: "50thPercentile" },
        { column: "duration", agg: "90thPercentile" },
        { column: "duration", agg: "95thPercentile" },
        { column: "duration", agg: "99thPercentile" },
        { column: "name" },
      ],
      filter: [
        ...globalFilterState,
        {
          type: "string",
          column: "type",
          operator: "=",
          value: "SPAN",
        },
      ],
      groupBy: [{ type: "string", column: "name" }],
      orderBy: [
        { column: "duration", agg: "95thPercentile", direction: "DESC" },
      ],
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );

  const tracesLatencies = api.dashboard.chart.useQuery(
    {
      projectId,
      from: "traces_metrics",
      select: [
        { column: "duration", agg: "50thPercentile" },
        { column: "duration", agg: "90thPercentile" },
        { column: "duration", agg: "95thPercentile" },
        { column: "duration", agg: "99thPercentile" },
        { column: "traceName" },
      ],
      filter: [...createTracesTimeFilter(globalFilterState)],
      groupBy: [{ type: "string", column: "traceName" }],
      orderBy: [
        { column: "duration", agg: "95thPercentile", direction: "DESC" },
      ],
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );

  const generateLatencyData = (data?: DatabaseRow[]) => {
    return data
      ? data
          .filter((item) => item.name !== null)
          .map((item, i) => [
            <div key={`${item.name as string}-${i}`}>
              <Popup
                triggerContent={truncate(item.name as string)}
                description={item.name as string}
              />
            </div>,
            ...[
              "percentile50Duration",
              "percentile90Duration",
              "percentile95Duration",
              "percentile99Duration",
            ].map((percentile) => (
              <RightAlignedCell key={`${i}-${percentile}`}>
                {item[percentile]
                  ? formatIntervalSeconds(item[percentile] as number, 3)
                  : "-"}
              </RightAlignedCell>
            )),
          ])
      : [];
  };

  return (
    <>
      <DashboardCard
        className="col-span-1 xl:col-span-2"
        title="트레이스 레이턴시"
        isLoading={tracesLatencies.isLoading}
      >
        <DashboardTable
          headers={[
            "트레이스 이름",
            <RightAlignedCell key="50th">50th</RightAlignedCell>,
            <RightAlignedCell key="90th">90th</RightAlignedCell>,
            <RightAlignedCell key="95th">
              95th<span className="ml-1">▼</span>
            </RightAlignedCell>,
            <RightAlignedCell key="99th">99th</RightAlignedCell>,
          ]}
          rows={generateLatencyData(
            tracesLatencies.data
              ?.filter((item) => item.traceName !== null)
              .map((item) => {
                return { ...item, name: item.traceName as string };
              }),
          )}
          collapse={{ collapsed: 5, expanded: 20 }}
        />
      </DashboardCard>
      <DashboardCard
        className="col-span-1 xl:col-span-2"
        title="생성 레이턴시"
        isLoading={generationsLatencies.isLoading}
      >
        <DashboardTable
          headers={[
            "생성 이름",
            <RightAlignedCell key="50th">50th</RightAlignedCell>,
            <RightAlignedCell key="90th">90th</RightAlignedCell>,
            <RightAlignedCell key="95th">
              95th<span className="ml-1">▼</span>
            </RightAlignedCell>,
            <RightAlignedCell key="99th">99th</RightAlignedCell>,
          ]}
          rows={generateLatencyData(generationsLatencies.data)}
          collapse={{ collapsed: 5, expanded: 20 }}
        />
      </DashboardCard>
      <DashboardCard
        className="col-span-1 xl:col-span-2"
        title="스팬 레이턴시"
        isLoading={spansLatencies.isLoading}
      >
        <DashboardTable
          headers={[
            "스팬 이름",
            <RightAlignedCell key="50th">50th</RightAlignedCell>,
            <RightAlignedCell key="90th">90th</RightAlignedCell>,
            <RightAlignedCell key="95th">
              95th<span className="ml-1">▼</span>
            </RightAlignedCell>,
            <RightAlignedCell key="99th">99th</RightAlignedCell>,
          ]}
          rows={generateLatencyData(spansLatencies.data)}
          collapse={{ collapsed: 5, expanded: 20 }}
        />
      </DashboardCard>
    </>
  );
};
