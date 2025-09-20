import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { Tent } from "@phosphor-icons/react/dist/ssr/Tent";

export interface TasksProgressProps {
	sx?: SxProps;
	value: number;
}

export function TasksProgress({ value, sx }: TasksProgressProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardContent>
				<Stack spacing={2}>
					<Stack
						direction="row"
						sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-around" }}
						spacing={3}
					>
						{/* <Stack spacing={1}> */}
						<Typography color="text.secondary" gutterBottom variant="overline" sx={{ fontSize: "17px" }}>
							Total camps
						</Typography>
						{/* </Stack> */}
						<Avatar sx={{ backgroundColor: "var(--mui-palette-warning-main)", height: "56px", width: "56px" }}>
							<Tent fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</Stack>
					<Typography sx={{ display: "flex", justifyContent: "center" }} variant="h3">
						{value}
					</Typography>
					{/* <div>
            <LinearProgress value={value} variant="determinate" />
          </div> */}
				</Stack>
			</CardContent>
		</Card>
	);
}
