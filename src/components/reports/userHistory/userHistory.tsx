"use client";

import React, { useEffect, useState } from "react";
import reportApi from "@/api/report.api";
import userApi from "@/api/user.api";
import {
	Alert,
	Box,
	Button,
	MenuItem,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";

interface RequestItem {
	_id: string;
	requestName: string; // from requestId.title
	categoryName: string; // from requestId.categoryId.categoryName
	userName: string; // from userId.fullName
	mobileNo: string; // from userId.mobileNo
	amountDonate: number; // from payment.amount
	paymentMode: string; // UPI, Card, etc.
	paymentStatus: string; // success, pending, failed
	referenceNo: string; // transaction reference
	createdAt: string; // ISO string / formatted date
}

interface CategoryItem {
	fullName: string;
	_id: string;
}

const ReportPage: React.FC = () => {
	const [requestList, setRequestList] = useState<RequestItem[]>([]);
	const [users, setUser] = useState<CategoryItem[]>([]);
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	// Snackbar state
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

	// Filters
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [selectedUser, setSelectedUser] = useState<string>("");

	const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
	};

	const getUserDetails = async () => {
		try {
			const response = await userApi.getUser({});
			if (response?.status) {
				setUser(response?.data?.data?.data || []);
			} else {
				showSnackbar("Failed to fetch users", "warning");
			}
		} catch (err) {
			console.error(err);
			showSnackbar("Error fetching users", "error");
		}
	};

	const fetchReportData = async () => {
		try {
			const params: any = { page: page + 1, limit };
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (selectedUser) params.userId = selectedUser;

			const response = await reportApi.getPaymentHistoryByUser(params);

			if (response?.status) {
				const data = response?.response?.data || [];
				setRequestList(data);
				setTotal(response?.response?.total || 0);

				if (data.length > 0) {
					showSnackbar("Data fetched successfully", "success");
				} else {
					showSnackbar("No records found", "warning");
				}
			} else {
				setRequestList([]);
				setTotal(0);
				showSnackbar("No data available", "warning");
			}
		} catch (error) {
			console.error(error);
			setRequestList([]);
			setTotal(0);
			showSnackbar("Error fetching report data", "error");
		}
	};

	useEffect(() => {
		getUserDetails();
	}, []);

	useEffect(() => {
		fetchReportData();
	}, [page, limit]);

	const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

	const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLimit(parseInt(e.target.value, 10));
		setPage(0);
	};

	const handleSubmit = () => {
		setPage(0);
		fetchReportData();
	};

	return (
		<Box>
			{/* Page Title */}
			<Typography variant="h5" fontWeight="bold" mb={5} color="text.primary">
				User History
			</Typography>

			{/* Filters */}
			<Box
				display="flex"
				// justifyContent="space-between"
				flexWrap="wrap"
				alignItems="center"
				mb={3}
				gap={6}
			>
				<TextField
					label="Start Date"
					type="date"
					InputLabelProps={{ shrink: true }}
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					sx={{ minWidth: 230 }}
				/>
				<TextField
					label="End Date"
					type="date"
					InputLabelProps={{ shrink: true }}
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					sx={{ minWidth: 230 }}
				/>
				<TextField
					select
					label="Select user"
					value={selectedUser}
					onChange={(e) => setSelectedUser(e.target.value)}
					sx={{ minWidth: 230 }}
				>
					{users.map((cat) => (
						<MenuItem key={cat._id} value={cat._id}>
							{cat.fullName}
						</MenuItem>
					))}
				</TextField>
				<Button
					variant="contained"
					onClick={handleSubmit}
					sx={{
						backgroundColor: "#022f3a",
						"&:hover": { backgroundColor: "#04566e" },
						minWidth: 100,
					}}
				>
					Submit
				</Button>
			</Box>

			{/* Table */}
			{requestList?.length > 0 ? (
				<>
					<Paper sx={{ width: "100%", overflowX: "auto" }}>
						<Box sx={{ minWidth: "1500px" }}>
							{" "}
							<Table
								stickyHeader
								sx={{
									border: "1px solid rgba(224, 224, 224, 1)",
									tableLayout: "fixed", // important for respecting widths
								}}
								size="medium"
							>
								<TableHead>
									<TableRow
										sx={{
											backgroundColor: "#1976d2 !important", // any hex, rgb, or theme color
											"& th": { color: "#fff", fontWeight: "bold" },
										}}
									>
										<TableCell sx={{ width: "90px" }}>S.No</TableCell>
										<TableCell sx={{ width: "250px" }}>Request Title</TableCell>
										<TableCell sx={{ width: "200px" }}>Category</TableCell>
										<TableCell sx={{ width: "200px" }}>User Name</TableCell>
										<TableCell sx={{ width: "200px" }}>Mobile No</TableCell>
										<TableCell sx={{ width: "200px" }}>Amount Donated</TableCell>
										<TableCell sx={{ width: "150px" }}>Payment Mode</TableCell>
										<TableCell sx={{ width: "150px" }}>Payment Status</TableCell>
										<TableCell sx={{ width: "200px" }}>Reference No</TableCell>
										<TableCell sx={{ width: "250px" }}>Created At</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{requestList.map((p, index) => (
										<TableRow
											key={index}
											sx={{
												"& td, & th": {
													border: "1px solid rgba(224, 224, 224, 1)",
													whiteSpace: "nowrap", // prevent text wrapping
													overflow: "hidden",
													textOverflow: "ellipsis", // truncate if too long
												},
											}}
										>
											<TableCell>{page * limit + index + 1}</TableCell>
											<TableCell>{p.requestName}</TableCell>
											<TableCell>{p.categoryName}</TableCell>
											<TableCell>{p.userName}</TableCell>
											<TableCell>{p.mobileNo}</TableCell>
											<TableCell>{p.amountDonate}</TableCell>
											<TableCell>{p.paymentMode}</TableCell>
											<TableCell>{p.paymentStatus}</TableCell>
											<TableCell>{p.referenceNo}</TableCell>
											<TableCell>
												{new Date(p.createdAt).toLocaleString("en-IN", {
													timeZone: "Asia/Kolkata",
												})}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Paper>
					<TablePagination
						component="div"
						count={total}
						page={page}
						onPageChange={handleChangePage}
						rowsPerPage={limit}
						onRowsPerPageChange={handleChangeRowsPerPage}
						rowsPerPageOptions={[5, 10, 25, 50]}
					/>
				</>
			) : (
				<>
					<Typography variant="h6" fontWeight="500" color="text.secondary" align="center" sx={{ mt: 5 }}>
						No datas fetched you need to select the dates and user
					</Typography>
				</>
			)}
			{/* Snackbar */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert
					onClose={() => setSnackbarOpen(false)}
					severity={snackbarSeverity}
					sx={{ width: "100%" }}
					variant="filled"
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default ReportPage;
