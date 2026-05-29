"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { [key: string]: { label: string, color?: string, icon?: React.ComponentType } }
export type ChartConfig = {
  [key: string]: {
    label: React.ReactNode
    color?: string
    icon?: React.ComponentType
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ className, config, children, ...props }, ref) => {
  const chartId = React.useId()

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot_circle]:fill-background [&_.recharts-active-dot_circle]:stroke-background [&_.recharts-sector]:stroke-background [&_.recharts-sector_path]:stroke-background [&_.recharts-legend-item]:!inline-flex [&_.recharts-legend-item]:items-center [&_.recharts-legend-item]:gap-1.5 [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-reference-line_line]:stroke-border [&_.recharts-reference-line-label]:fill-muted-foreground [&_.recharts-responsive-container]:!w-full [&_.recharts-responsive-container]:!h-full [&_.recharts-sheet]:!w-full [&_.recharts-sheet]:!h-full [&_.recharts-surface]:!overflow-visible [&_.recharts-surface]:!w-full [&_.recharts-surface]:!h-full [&_.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-tooltip-wrapper]:focus:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, value]) => value.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, value]) => {
            if (!value.color) return null
            return `
              [data-chart="${id}"] {
                --color-${key}: ${value.color};
              }
            `
          })
          .filter(Boolean)
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: string
    labelFormatter?: (label: string) => React.ReactNode
    formatter?: (value: any, name: string) => React.ReactNode
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
  }
>(
  (
    {
      className,
      active,
      payload,
      label,
      labelFormatter,
      formatter,
      indicator = "dot",
      hideLabel = false,
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-md",
          className
        )}
      >
        {!hideLabel && (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(label!) : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = item.name || item.dataKey
            const configItem = config[key]

            return (
              <div
                key={index}
                className="flex items-center gap-1.5 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                {indicator === "dot" && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color || item.payload?.fill,
                    }}
                  />
                )}
                <span className="text-muted-foreground">
                  {configItem?.label || key}
                </span>
                <span className="font-mono font-medium text-foreground ml-auto">
                  {formatter ? formatter(item.value, key) : item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}
