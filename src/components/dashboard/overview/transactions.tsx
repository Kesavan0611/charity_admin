import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { CashRegister } from "@phosphor-icons/react/dist/ssr/CashRegister";

export interface TotalProfitProps {
	sx?: SxProps;
	value: string;
}

export function Transactions({ value, sx }: TotalProfitProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardContent>
				<Stack
					direction="row"
					sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-around" }}
					spacing={3}
				>
					{/* <Stack spacing={1}> */}
					<Typography color="text.secondary" variant="overline" sx={{ fontSize: "17px" }}>
						Transactions
					</Typography>
					{/* </Stack> */}
					<Avatar sx={{ backgroundColor: "var(--mui-palette-error-main)", height: "56px", width: "56px" }}>
						<CashRegister fontSize="var(--icon-fontSize-lg)" />
					</Avatar>
				</Stack>
				<Typography sx={{ display: "flex", justifyContent: "center" }} variant="h3">
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
}
