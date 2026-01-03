"use client";

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { activityChartData } from "@/lib/data";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--primary))",
  },
  deliveries: {
    label: "Deliveries",
    color: "hsl(var(--accent))",
  },
};

export default function ActivityChart() {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Today's Activity</CardTitle>
        <CardDescription>Visitor and delivery traffic throughout the day.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="visitors"
                  type="monotone"
                  stroke={chartConfig.visitors.color}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="deliveries"
                  type="monotone"
                  stroke={chartConfig.deliveries.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
