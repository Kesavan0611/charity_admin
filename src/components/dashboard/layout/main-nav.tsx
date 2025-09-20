"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";

// ✅ Mock auth client
import { authClient } from "@/lib/auth/client";
import { usePopover } from "@/hooks/use-popover";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";

export function MainNav(): React.JSX.Element {
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const [openModal, setOpenModal] = React.useState<boolean>(false);
	const router = useRouter();

    // ✅ Redirect to signin if no token
  // React.useEffect(() => {
  //   const token = localStorage.getItem("custom-auth-token");
  //   if (!token) {
  //     router.replace("/auth/sign-in"); // replace avoids going back to dashboard with "Back" button
  //   }
  // }, [router]);

	// ✅ For demo, fetch from localStorage (replace with global state or API)
	const adminData = {
		name: localStorage.getItem("admin_name") || "Admin",
		email: localStorage.getItem("admin_email") || "admin@charity.com",
		role: localStorage.getItem("admin_role") || "admin",
	};

	const handleLogout = async () => {
		try {
			localStorage.removeItem("custom-auth-token");

			router.push("/auth/sign-in");
      window.location.reload()
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const userPopover = usePopover<HTMLDivElement>();

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid var(--mui-palette-divider)",
					backgroundColor: "var(--mui-palette-background-paper)",
					position: "sticky",
					top: 0,
					zIndex: "var(--mui-zIndex-appBar)",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					sx={{ alignItems: "center", justifyContent: "space-between", minHeight: "64px", px: 2 }}
				>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							sx={{ display: { lg: "none" } }}
						>
							<ListIcon />
						</IconButton>
						{/* <Tooltip title="Search">
							<IconButton>
								<MagnifyingGlassIcon />
							</IconButton>
						</Tooltip> */}
					</Stack>
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
						{/* <Tooltip title="Contacts">
							<IconButton>
								<UsersIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Notifications">
							<Badge badgeContent={4} color="success" variant="dot">
								<IconButton>
									<BellIcon />
								</IconButton>
							</Badge>
						</Tooltip> */}
						<Avatar
							// onClick={userPopover.handleOpen}
							onClick={() => setOpenModal(true)}
							// ref={userPopover.anchorRef}
							src="/assets/avatar-1.png"
							sx={{ cursor: "pointer" }}
						/>
					</Stack>
				</Stack>
			</Box>
			<UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

			{/* ✅ Admin Details Modal */}
			<Dialog
				open={openModal}
				onClose={() => setOpenModal(false)}
				sx={{
					"& .MuiDialog-paper": {
						width: "600px", // custom width
						maxWidth: "90%", // responsive
					},
				}}
			>
				<DialogTitle>Admin Details</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body1">
						<strong>Name:</strong> {adminData.name}
					</Typography>
					<Typography variant="body1">
						<strong>Email:</strong> {adminData.email}
					</Typography>
					{/* <Typography variant="body1">
						<strong>Role:</strong> {adminData.role}
					</Typography> */}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenModal(false)}>Close</Button>
					<Button color="error" variant="contained" onClick={handleLogout}>
						Logout
					</Button>
				</DialogActions>
			</Dialog>
			<MobileNav
				onClose={() => {
					setOpenNav(false);
				}}
				open={openNav}
			/>
		</React.Fragment>
	);
}
