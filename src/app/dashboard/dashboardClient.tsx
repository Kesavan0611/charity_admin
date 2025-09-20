"use client";

import * as React from "react";
import Image from "next/image";
import requestApi from "@/api/request.api";
import {
	Avatar,
	Badge,
	Box,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { BellRinging } from "@phosphor-icons/react/dist/ssr/BellRinging";

import { useSocket } from "@/contexts/socketcontext";
import { Budget } from "@/components/dashboard/overview/budget";
import { Sales } from "@/components/dashboard/overview/sales";
import { TasksProgress } from "@/components/dashboard/overview/tasks-progress";
import { TotalCustomers } from "@/components/dashboard/overview/total-customers";
import { TotalProfit } from "@/components/dashboard/overview/total-profit";
import { Traffic } from "@/components/dashboard/overview/traffic";
import { Transactions } from "@/components/dashboard/overview/transactions";

import notificationImage from "../../../public/assets/notificationImage.png";

interface DashboardCounts {
	totalUsers: number;
	totalCamps: number;
	donatedUserCount: number;
	happyFaceCount: number;
	transactions: number;
}

interface Notification {
	_id: string;
	title: string;
	raisedAmount: number;
	totalDonation: number;
	createdAt: string;
	userId?: {
		_id: string;
		name: string;
		email: string;
	};
	categoryId?: {
		name: string;
	};
	notificationStatus?: boolean;
}

export default function DashboardClient(): React.JSX.Element {
	const [counts, setCounts] = React.useState<DashboardCounts>({
		totalUsers: 0,
		totalCamps: 0,
		donatedUserCount: 0,
		happyFaceCount: 0,
		transactions: 0,
	});
	const [requestCamp, setRequestCamp] = React.useState([
		{ name: "Request", data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
		{ name: "Camp", data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
	]);
	const [categoryRequest, setCategoryRequest] = React.useState([]);
	const [categoryRequestCounts, setCategoryRequestCounts] = React.useState([]);
	const [categoryRequestLables, setCategoryRequestLables] = React.useState([]);

	const [open, setOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);

	const { socket, isConnected, notifications, unreadCount, setUnreadCount, setNotifications } = useSocket();

	React.useEffect(() => {
		getCardDetails();
		getRequestCamp();
		getCategoryRequest();
	}, []);

	const getCardDetails = async () => {
		try {
			const response = await requestApi.getCardDetails();
			if (response.status) {
				setCounts(response?.response?.data);
			}
		} catch (error) {
			console.error("Error fetching card details", error);
		}
	};
	const getRequestCamp = async () => {
		try {
			const response = await requestApi.getRequestCamp();
			if (response.status) {
				setRequestCamp(response?.response?.data);
			}
		} catch (error) {
			console.error("Error fetching card details", error);
		}
	};
	const getCategoryRequest = async () => {
		try {
			const response = await requestApi.getCategoryRequest();
			console.log(response?.response?.data);

			if (response.status) {
				const data = response?.response?.data || [];

				// Extract labels and counts
				const labels = data.map((item: any) => item.categoryName);
				const counts = data.map((item: any) => item.requestCount);

				setCategoryRequest(data); // full data if needed
				setCategoryRequestCounts(counts); // only counts
				setCategoryRequestLables(labels); // only labels
			}
		} catch (error) {
			console.error("Error fetching card details", error);
		}
	};

	const markNotificationsAsRead = async () => {
		try {
			// Get IDs of all notifications that should be marked as read
			// (non-pending notifications that are still marked as unread)
			const notificationsToMarkAsRead = notifications
				.filter((n) => n.status !== "pending" && n.notificationStatus === true)
				.map((n) => n._id);

			if (notificationsToMarkAsRead.length > 0) {
				await requestApi.markNotificationsAsRead({
					notificationIds: notificationsToMarkAsRead,
				});

				// Update local state
				setNotifications((prev) =>
					prev.map((notification) => ({
						...notification,
						notificationStatus: notificationsToMarkAsRead.includes(notification._id)
							? false
							: notification.notificationStatus,
					}))
				);

				// Update unread count
				setUnreadCount((prev) => Math.max(0, prev - notificationsToMarkAsRead.length));
			}
		} catch (error) {
			console.error("Error marking notifications as read", error);
		}
	};

	const handleOpen = async () => {
		setOpen(true);
		if (unreadCount > 0 && socket && isConnected) {
			try {
				// Request latest notifications
				socket.emit("get-notifications");
				await markNotificationsAsRead();
			} catch (error) {
				console.error("Error handling notifications", error);
			}
		}
	};

	const handleClose = () => setOpen(false);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Grid container spacing={3}>
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
			>
				<Budget diff={12} trend="up" sx={{ height: "100%" }} value={counts.totalUsers.toString()} />
			</Grid>
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
			>
				<TotalCustomers diff={16} trend="down" sx={{ height: "100%" }} value={counts.donatedUserCount.toString()} />
			</Grid>
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
			>
				<TasksProgress sx={{ height: "100%" }} value={counts.totalCamps} />
			</Grid>
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
			>
				<TotalProfit sx={{ height: "100%" }} value={counts.happyFaceCount.toString()} />
			</Grid>
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
			>
				<Transactions sx={{ height: "100%" }} value={counts.transactions.toString()} />
			</Grid>
			{/* <Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
				sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
			>
				<Avatar sx={{ backgroundColor: "var(--mui-palette-error-main)", height: "70px", width: "70px" }}>
					<BellRinging fontSize="var(--icon-fontSize-lg)" />
				</Avatar>
			</Grid> */}
			<Grid
				size={{
					lg: 4,
					sm: 6,
					xs: 12,
				}}
				sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
			>
				{/* <IconButton color="inherit" onClick={handleOpen} sx={{ p: 0 }}>
					<Badge badgeContent={unreadCount} color="error" max={9}>
						<Avatar
							sx={{
								backgroundColor: isConnected ? "var(--mui-palette-primary-main)" : "var(--mui-palette-error-main)",
								height: "70px",
								width: "70px",
							}}
						>
							<BellRinging fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</Badge>
				</IconButton> */}
				<IconButton color="inherit" onClick={handleOpen} sx={{ p: 0 }}>
					<Badge
						badgeContent={unreadCount}
						color="error"
						max={9}
						sx={{
							"& .MuiBadge-badge": {
								fontSize: "1rem", // increase text size
								height: "34px", // increase circle height
								minWidth: "34px", // increase circle width
								borderRadius: "16px", // keep it round
							},
						}}
						overlap="circular" // important for round overlays
						anchorOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
					>
						<Avatar
							sx={{
								height: 100,
								width: 100,
								p: 1, // optional padding to fit image nicely
							}}
						>
							<Image
								src={notificationImage}
								alt="Notifications"
								width={300} // adjust size as needed
								height={100}
								style={{ objectFit: "contain" }}
							/>
						</Avatar>
					</Badge>
				</IconButton>
				{!isConnected && <Chip label="Connecting..." color="warning" size="small" sx={{ ml: 1 }} />}
			</Grid>

			{/* Notification Dialog */}
			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>
					<Typography sx={{ fontSize: "20px" }}>Notifications</Typography>
					<Typography variant="body2" color="textSecondary">
						Pending Requests {unreadCount > 0 && `(${unreadCount} new)`}
					</Typography>
				</DialogTitle>
				<DialogContent>
					{notifications.filter((n) => n.status === "pending" && n.notificationStatus === true).length === 0 ? (
						<Typography variant="body2" color="textSecondary" textAlign="center" p={2}>
							No pending requests
						</Typography>
					) : (
						<List>
							{notifications
								.filter((n) => n.status === "pending" && n.notificationStatus === true)
								.map((notification, index) => (
									<ListItem key={`${notification._id}-${index}`} alignItems="flex-start">
										<ListItemAvatar>
											<Avatar>{notification.userId?.name?.charAt(0) || "U"}</Avatar>
										</ListItemAvatar>
										<ListItemText
											primary={
												<Box display="flex" alignItems="center">
													<Typography variant="subtitle2">{notification.title}</Typography>
													{notification.notificationStatus && (
														<Chip label="New" color="primary" size="small" sx={{ ml: 1 }} />
													)}
												</Box>
											}
											secondary={
												<>
													<Typography component="span" variant="body2" color="text.primary">
														Requested: ₹{notification.totalDonation}
													</Typography>
													{notification.userId?.name && (
														<Typography variant="caption" color="text.secondary">
															By: {notification.userId.name}
														</Typography>
													)}
													{notification.categoryId?.name && (
														<>
															<br />
															<Typography variant="caption" color="text.secondary">
																Category: {notification.categoryId.name}
															</Typography>
														</>
													)}
													<br />
													<Typography variant="caption" color="textSecondary">
														{formatDate(notification.createdAt)}
													</Typography>
												</>
											}
										/>{" "}
									</ListItem>
								))}
						</List>
					)}
				</DialogContent>
			</Dialog>

			<Grid
				size={{
					lg: 8,
					xs: 12,
				}}
			>
				<Sales chartSeries={requestCamp} sx={{ height: "100%" }} />
			</Grid>
			<Grid
				size={{
					lg: 4,
					md: 6,
					xs: 12,
				}}
			>
				<Traffic chartSeries={categoryRequestCounts} labels={categoryRequestLables} sx={{ height: "100%" }} />
			</Grid>

			{/* <Grid
        size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
        <LatestProducts
          products={[
            {
              id: 'PRD-005',
              name: 'Soja & Co. Eucalyptus',
              image: '/assets/product-5.png',
              updatedAt: dayjs().subtract(18, 'minutes').subtract(5, 'hour').toDate(),
            },
            {
              id: 'PRD-004',
              name: 'Necessaire Body Lotion',
              image: '/assets/product-4.png',
              updatedAt: dayjs().subtract(41, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-003',
              name: 'Ritual of Sakura',
              image: '/assets/product-3.png',
              updatedAt: dayjs().subtract(5, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-002',
              name: 'Lancome Rouge',
              image: '/assets/product-2.png',
              updatedAt: dayjs().subtract(23, 'minutes').subtract(2, 'hour').toDate(),
            },
            {
              id: 'PRD-001',
              name: 'Erbology Aloe Vera',
              image: '/assets/product-1.png',
              updatedAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid> */}
			{/* <Grid
        size={{
          lg: 8,
          md: 12,
          xs: 12,
        }}
      >
        <LatestOrders
          orders={[
            {
              id: 'ORD-007',
              customer: { name: 'Ekaterina Tankova' },
              amount: 30.5,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-006',
              customer: { name: 'Cao Yu' },
              amount: 25.1,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-004',
              customer: { name: 'Alexa Richardson' },
              amount: 10.99,
              status: 'refunded',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-003',
              customer: { name: 'Anje Keizer' },
              amount: 96.43,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-002',
              customer: { name: 'Clarke Gillebert' },
              amount: 32.54,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-001',
              customer: { name: 'Adam Denisov' },
              amount: 16.76,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid> */}
		</Grid>
	);
}
