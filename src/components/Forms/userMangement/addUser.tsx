"use client";

import React, { useEffect, useState } from "react";
import userApi from "@/api/user.api";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormHelperText,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Modal,
	Paper,
	Select,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import axios from "axios";

type Gender = "Male" | "Female" | "Other";
type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

interface User {
	_id: string;
	fullName: string;
	mobileNo: string;
	email?: string;
	dob: string; // ISO yyyy-mm-dd
	gender: Gender | "";
	bloodGroup: BloodGroup | "";
	address: string;
	area: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	profileImage?: string;
	profile?: File | null;
	status: string;
}

const modalStyle = {
	position: "absolute" as const,
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "620px",
	maxWidth: "95vw",
	maxHeight: "90vh",
	overflowY: "auto",
	bgcolor: "background.paper",
	boxShadow: 24,
	borderRadius: 2,
	p: 3,
};

export default function UsersPage() {
	// Data
	const [users, setUsers] = React.useState<User[]>([]);
	const [totalRecords, setTotalRecords] = React.useState(0);
	const [totalPages, setTotalPages] = React.useState(0);

	// ✅ Pagination + Search
	const [page, setPage] = useState(0); // MUI starts from 0
	const [limit, setLimit] = useState(5);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState("");

	// Modals
	const [openForm, setOpenForm] = React.useState(false);
	const [openView, setOpenView] = React.useState(false);
	const [openDelete, setOpenDelete] = React.useState<null | string>(null);

	// Editing
	const [editingId, setEditingId] = React.useState<string | null>(null);

	// Form State
	const [form, setForm] = React.useState<User>({
		_id: "",
		fullName: "",
		mobileNo: "",
		email: "",
		dob: "",
		gender: "",
		bloodGroup: "",
		address: "",
		area: "",
		city: "",
		state: "",
		country: "",
		pincode: "",
		profileImage: "",
		profile: null,
		status: "",
	});
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// View state
	const [viewUser, setViewUser] = React.useState<User | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "success" });

	const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
		setSnackbar({ open: true, message, severity });
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};
	// Handlers
	const handleInput = (name: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm((prev) => ({ ...prev, [name]: e.target.value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleSelect = (name: keyof User) => (e: any) => {
		setForm((prev) => ({ ...prev, [name]: e.target.value }));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setForm((prev) => ({ ...prev, profile: file ?? null }));
		setErrors((prev) => ({ ...prev, profile: "" }));
	};

	const resetForm = () => {
		setForm({
			_id: "",
			fullName: "",
			mobileNo: "",
			email: "",
			dob: "",
			gender: "",
			bloodGroup: "",
			address: "",
			area: "",
			city: "",
			state: "",
			country: "",
			pincode: "",
			profileImage: "",
			profile: null,
			status: "",
		});
		setErrors({});
		setEditingId(null);
	};

	// Validation
	const validate = () => {
		const e: Record<string, string> = {};
		if (!form.fullName.trim()) e.fullName = "Full name is required";
		if (!/^\d{10}$/.test(form.mobileNo)) e.mobile = "Enter 10-digit mobile";
		if (!form.dob) e.dob = "Date of birth is required";
		if (!form.gender) e.gender = "Select gender";
		if (!form.bloodGroup) e.bloodGroup = "Select blood group";
		if (!form.address.trim()) e.address = "Address is required";
		if (!form.area.trim()) e.area = "Area is required";
		if (!form.city.trim()) e.city = "City is required";
		if (!form.state.trim()) e.state = "State is required";
		if (!form.country.trim()) e.country = "Country is required";
		if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter 6-digit pincode";
		return e;
	};

	const openAdd = () => {
		resetForm();
		setOpenForm(true);
	};

	const openEdit = (u: User) => {
		// Format date for input field (yyyy-mm-dd)
		const formattedDob = u.dob ? u.dob.split("T")[0] : "";

		setForm({
			...u,
			dob: formattedDob,
			profile: null, // do not carry old file object
		});
		setEditingId(u._id);
		setOpenForm(true);
	};

	const fetchUsers = async (pageNum: number, pageSize: number, search: string) => {
		try {
			const response = await userApi.getUser({
				page: pageNum + 1,
				limit: pageSize,
				search: search || "",
			});
			console.log(response,"response")
			if (response?.data?.data?.data) {
				setUsers(response.data.data.data);
				setTotalRecords(response.data.data.totalRecords);
				setTotalPages(response.data.data.totalPages);
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchUsers(page, limit, search);
	}, [page, limit, search]);

	const saveUser = async () => {
		const v = validate();
		if (Object.keys(v).length) {
			setErrors(v);
			return;
		}

		const formData = new FormData();
		formData.append("fullName", form.fullName || "");
		formData.append("mobileNo", form.mobileNo || "");
		formData.append("email", form.email || "");
		formData.append("dob", form.dob || "");
		formData.append("gender", form.gender || "");
		formData.append("bloodGroup", form.bloodGroup || "");
		formData.append("address", form.address || "");
		formData.append("area", form.area || "");
		formData.append("city", form.city || "");
		formData.append("state", form.state || "");
		formData.append("country", form.country || "");
		formData.append("pincode", form.pincode || "");

		if (form.profile) {
			formData.append("image", form.profile); // single File
		}

		try {
			if (editingId) {
				const response = await userApi.updateUser(editingId, formData);
				if (response) {
					alert("User updated successfully");
					setOpenForm(false);
					fetchUsers(page, limit, search);
				}
			} else {
				const response = await userApi.addUser(formData);
				if (response) {
					alert("User added successfully");
					setOpenForm(false);
					fetchUsers(page, limit, search);
				}
			}
		} catch (error) {
			console.error("Error saving user:", error);
			alert("Error saving user");
		}
	};

	const confirmDelete = (id: string) => setOpenDelete(id);

	const doDelete = async () => {
		if (openDelete !== null) {
			try {
				const response = await userApi.deleteUser(openDelete);
				if (response.status) {
					showSnackbar("User deleted successfully!", "success");
					setOpenDelete(null);
					fetchUsers(page, limit, search);
				}
			} catch (error) {
				console.error("Error deleting user:", error);
				showSnackbar("Error deleting user", "error");
			}
		}
	};
	const approveFunction = async (id: any) => {
		try {
			const response = await userApi.approveStatus(id, { status: "approved" });
			if (response) {
				alert("User Approved Successfully");
				fetchUsers(page, limit, search);
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			alert("Error deleting user");
		}
	};

	const openViewer = (u: User) => {
		setViewUser(u);
		setOpenView(true);
	};

	// Filter + paginate
	const filtered = users.filter((u) =>
		`${u.fullName} ${u.mobileNo} ${u.city} ${u.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
	);

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setLimit(parseInt(e.target.value, 10));
		setPage(0); // reset page
	};
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearch(value);
		setPage(0); // reset to first page
		fetchUsers(1, limit, search);
	};
	return (
		<Box>
			{/* Top Bar */}
			<Typography variant="h5" fontWeight="bold" mb={5} color="text.primary">
				User List
			</Typography>
			<Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
				<TextField
					label="Search Users"
					variant="outlined"
					size="small"
					value={search}
					onChange={(e) => {
						const value = e.target.value;
						setSearch(value);
						setPage(0);
						if (value.trim() === "") {
							fetchUsers(0, limit, search);
						}
					}}
				/>
				{/* <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
					Add User
				</Button> */}
			</Box>

			{/* Table */}
			<Paper>
				<CardContent sx={{ p: 0 }}>
					<Table sx={{ minWidth: 900 }}>
						<TableHead>
							<TableRow>
								<TableCell>Profile</TableCell>
								<TableCell>Full Name</TableCell>
								<TableCell>Mobile</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>City</TableCell>
								<TableCell>Gender</TableCell>
								<TableCell>Blood Group</TableCell>
								<TableCell align="center" width={180}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filtered.map((u) => (
								<TableRow key={u._id} hover>
									<TableCell>
										<Avatar src={u.profileImage || undefined} alt={u.fullName} sx={{ width: 40, height: 40 }}>
											{u.fullName?.[0] || "U"}
										</Avatar>
									</TableCell>
									<TableCell>{u.fullName}</TableCell>
									<TableCell>{u.mobileNo}</TableCell>
									<TableCell>{u.email || "-"}</TableCell>
									<TableCell>{u.city}</TableCell>
									<TableCell>{u.gender}</TableCell>
									<TableCell>{u.bloodGroup}</TableCell>
									<TableCell align="center">
										<Box sx={{ display: "inline-flex", gap: 1 }}>
											<Tooltip title="View">
												<IconButton size="small" sx={{ bgcolor: "action.hover" }} onClick={() => openViewer(u)}>
													<VisibilityIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<IconButton size="small" sx={{ bgcolor: "action.hover" }} onClick={() => confirmDelete(u._id)}>
												<DeleteIcon />
											</IconButton>
										</Box>
									</TableCell>
								</TableRow>
							))}

							{filtered.length === 0 && (
								<TableRow>
									<TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
										No users found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
				<TablePagination
					component="div"
					count={totalRecords}
					rowsPerPage={limit}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
				/>
			</Paper>

			{/* Add/Edit User Modal */}
			<Modal open={openForm} onClose={() => setOpenForm(false)}>
				<Box sx={modalStyle}>
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
						<Typography variant="h6">{editingId ? "Edit User" : "Add User"}</Typography>
						<IconButton onClick={() => setOpenForm(false)}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Form Content */}
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{/* Profile */}
						<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
							<Avatar
								sx={{ width: 96, height: 96 }}
								src={form.profile ? URL.createObjectURL(form.profile) : form.profileImage || undefined}
							>
								{form.fullName?.[0] || "U"}
							</Avatar>
							<Button variant="outlined" component="label" fullWidth>
								Upload Profile (Optional)
								<input hidden type="file" accept="image/*" onChange={handleProfile} />
							</Button>
						</Box>

						{/* Inputs - 1 per row */}
						<TextField
							fullWidth
							label="Full Name"
							value={form.fullName}
							onChange={handleInput("fullName")}
							error={!!errors.fullName}
							helperText={errors.fullName}
						/>

						<TextField
							fullWidth
							label="Mobile Number"
							value={form.mobileNo}
							onChange={handleInput("mobileNo")}
							error={!!errors.mobile}
							helperText={errors.mobile || "10 digits"}
							inputProps={{ inputMode: "numeric", maxLength: 10 }}
						/>

						<TextField
							fullWidth
							label="Email (Optional)"
							value={form.email || ""}
							onChange={handleInput("email")}
							error={!!errors.email}
							helperText={errors.email}
						/>

						<TextField
							fullWidth
							label="Date of Birth"
							type="date"
							value={form.dob}
							onChange={handleInput("dob")}
							InputLabelProps={{ shrink: true }}
							error={!!errors.dob}
							helperText={errors.dob}
						/>

						<FormControl fullWidth error={!!errors.gender}>
							<InputLabel>Gender</InputLabel>
							<Select label="Gender" value={form.gender} onChange={handleSelect("gender")}>
								<MenuItem value="Male">Male</MenuItem>
								<MenuItem value="Female">Female</MenuItem>
								<MenuItem value="Other">Other</MenuItem>
							</Select>
							<FormHelperText>{errors.gender}</FormHelperText>
						</FormControl>

						<FormControl fullWidth error={!!errors.bloodGroup}>
							<InputLabel>Blood Group</InputLabel>
							<Select label="Blood Group" value={form.bloodGroup} onChange={handleSelect("bloodGroup")}>
								{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
									<MenuItem key={bg} value={bg}>
										{bg}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>{errors.bloodGroup}</FormHelperText>
						</FormControl>

						<TextField
							fullWidth
							label="Address"
							value={form.address}
							onChange={handleInput("address")}
							error={!!errors.address}
							helperText={errors.address}
							multiline
							minRows={2}
						/>

						<TextField
							fullWidth
							label="Area"
							value={form.area}
							onChange={handleInput("area")}
							error={!!errors.area}
							helperText={errors.area}
						/>

						<TextField
							fullWidth
							label="City"
							value={form.city}
							onChange={handleInput("city")}
							error={!!errors.city}
							helperText={errors.city}
						/>

						<TextField
							fullWidth
							label="State"
							value={form.state}
							onChange={handleInput("state")}
							error={!!errors.state}
							helperText={errors.state}
						/>

						<TextField
							fullWidth
							label="Country"
							value={form.country}
							onChange={handleInput("country")}
							error={!!errors.country}
							helperText={errors.country}
						/>

						<TextField
							fullWidth
							label="Pincode"
							value={form.pincode}
							onChange={handleInput("pincode")}
							error={!!errors.pincode}
							helperText={errors.pincode || "6 digits"}
							inputProps={{ inputMode: "numeric", maxLength: 6 }}
						/>
					</Box>

					{/* Actions */}
					<Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
						<Button onClick={() => setOpenForm(false)}>Cancel</Button>
						<Button variant="contained" onClick={saveUser}>
							{editingId ? "Update" : "Create"}
						</Button>
					</Box>
				</Box>
			</Modal>

			{/* View Modal */}
			<Modal open={openView} onClose={() => setOpenView(false)}>
				<Box sx={modalStyle}>
					{/* Header */}
					<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
						<Typography variant="h5" fontWeight={700}>
							User Details
						</Typography>
						<IconButton onClick={() => setOpenView(false)}>
							<CloseIcon />
						</IconButton>
					</Box>

					{viewUser && (
						<Box display="flex" flexDirection="column" gap={3}>
							{/* Avatar & Basic Info */}
							<Box display="flex" alignItems="center" gap={3}>
								<Avatar
									sx={{ width: 100, height: 100, fontSize: 40, bgcolor: "primary.main" }}
									src={viewUser.profileImage || undefined}
								>
									{viewUser.fullName?.[0] || "U"}
								</Avatar>
								<Box>
									<Typography variant="h6" fontWeight={700}>
										{viewUser.fullName}
									</Typography>
									<Typography variant="body1" color="text.secondary">
										{viewUser.email || "No email"}
									</Typography>
									<Typography variant="body1">{viewUser.mobileNo}</Typography>
								</Box>
							</Box>

							<Divider />

							{/* Personal Info */}
							<Box>
								<Typography variant="subtitle1" fontWeight={600} gutterBottom>
									Personal Information
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>DOB:</b> {viewUser.dob ? new Date(viewUser.dob).toLocaleDateString() : "N/A"}
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>Gender:</b> {viewUser.gender || "N/A"}
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>Blood Group:</b> {viewUser.bloodGroup || "N/A"}
								</Typography>
							</Box>

							<Divider />

							{/* Address Info */}
							<Box>
								<Typography variant="subtitle1" fontWeight={600} gutterBottom>
									Address Details
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>Address:</b> {viewUser.address || "N/A"}
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>Area:</b> {viewUser.area || "N/A"}
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>City:</b> {viewUser.city || "N/A"}
								</Typography>
								<Typography variant="body1" gutterBottom>
									<b>State/Country:</b> {viewUser.state}, {viewUser.country}
								</Typography>
								<Typography variant="body1">
									<b>Pincode:</b> {viewUser.pincode}
								</Typography>
							</Box>

							{/* Actions */}
							{/* <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
								<Button
									variant="outlined"
									color="error"
									size="large"
									sx={{ px: 3, fontWeight: 600 }}
									onClick={() => alert("Rejected")}
								>
									Reject
								</Button>
								<Button
									variant="contained"
									color="success"
									size="large"
									sx={{ px: 3, fontWeight: 600 }}
									onClick={() => approveFunction(viewUser._id)}
								>
									Approve
								</Button>
							</Box> */}
						</Box>
					)}
				</Box>
			</Modal>

			{/* Delete Confirm */}
			<Dialog open={openDelete !== null} onClose={() => setOpenDelete(null)}>
				<DialogTitle>Delete user?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">This action cannot be undone.</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDelete(null)}>Cancel</Button>
					<Button color="error" variant="contained" onClick={doDelete}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={handleSnackbarClose}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
