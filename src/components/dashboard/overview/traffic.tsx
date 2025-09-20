"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { DeviceTabletIcon } from "@phosphor-icons/react/dist/ssr/DeviceTablet";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr/Phone";
import type { ApexOptions } from "apexcharts";

import { Chart } from "@/components/core/chart";

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, Icon>;

export interface TrafficProps {
	chartSeries: number[];
	labels: string[];
	sx?: SxProps;
}

export function Traffic({ chartSeries, labels, sx }: TrafficProps): React.JSX.Element {
	const chartOptions = useChartOptions(labels);

	return (
		<Card sx={sx}>
			<CardHeader title="Category based request" />
			<CardContent>
				<Stack spacing={2}>
					<Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
					<Stack
						direction="row"
						spacing={2}
						sx={{
							alignItems: "center",
							justifyContent: "center",
							flexWrap: "wrap", // ✅ allow multiple rows
							rowGap: 0, // ✅ vertical gap between rows
						}}
					>
						{chartSeries.map((item, index) => {
							const label = labels[index];
							const Icon = iconMapping[label];

							return (
								<Stack
									key={label}
									spacing={1}
									sx={{ alignItems: "center", minWidth: 100 }} // ✅ optional: keep min width
								>
									{Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
									<Typography sx={{ fontSize: "15px" }}>{label}</Typography>
									<Typography color="text.secondary" variant="subtitle2">
										{item}%
									</Typography>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}

function useChartOptions(labels: string[]): ApexOptions {
	const theme = useTheme();
 const customColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    "#9c27b0", // purple
    "#ff9800", // orange
    "#4caf50", // green
    "#00bcd4", // cyan
    "#795548", // brown
  ];
	return {
		chart: { background: "transparent" },
		colors:  labels.map((_, i) => customColors[i % customColors.length]),
		dataLabels: { enabled: false },
		labels,
		legend: { show: false },
		plotOptions: { pie: { expandOnClick: false } },
		states: { active: { filter: { type: "none" } }, hover: { filter: { type: "none" } } },
		stroke: { width: 0 },
		theme: { mode: theme.palette.mode },
		tooltip: { fillSeriesColor: false },
	};
}
