"use client";

import React, { useEffect, useState } from "react";
import requestApi from "@/api/request.api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
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
import { useDropzone } from "react-dropzone";

interface RequestData {
	id: number | string;
	title: string;
	category: string;
	totalDonation: number | string;
	donationLastDate: string;
	usagePlan: string;
	address: string;
	area: string;
	city: string;
	state: string;
	country: string;
	pincode: number | string;
	photo?: File | { docPath: string; originalName: string } | null;
	document?: File | { docPath: string; originalName: string } | null;
	status: string;
	responsiblePerson: string;
	contactNo: string;
}

interface RequestItem {
	_id: string;
	title: string;
	categoryId?: string;
	categoryName?: string;
	totalDonation: number;
	donationLastDate: string;
	usagePlan: string;
	address: string;
	area: string;
	city: string;
	state: string;
	country: string;
	pincode: number;
	status: string;
	photo?: { docPath: string; originalName: string }[];
	document?: { docPath: string; originalName: string }[];
	responsiblePerson: string;
	contactNo: string;
}

const RequestPage: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [requests, setRequests] = useState<RequestData[]>([]);

	// ✅ Pagination + Search
	const [page, setPage] = useState(0); // MUI starts from 0
	const [limit, setLimit] = useState(5);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState("");
	// Form state
	const [form, setForm] = useState<RequestData>({
		id: 0,
		title: "",
		category: "",
		totalDonation: "",
		donationLastDate: "",
		usagePlan: "",
		address: "",
		area: "",
		city: "",
		state: "",
		country: "",
		pincode: "",
		photo: null,
		document: null,
		status: "pending",
		responsiblePerson: "",
		contactNo: "",
	});
	const [category, setCategory] = useState([]);
	const [requestList, setRequestList] = useState<RequestItem[]>([]);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [previewRequest, setPreviewRequest] = useState<RequestItem | null>(null);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	// Snackbar state
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

	const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
	};

	useEffect(() => {
		getRequestListDetails();
		getCtegoryDetails();
	}, []);

	useEffect(() => {
		// getRequestListDetails();
		const delayDebounce = setTimeout(() => {
			getRequestListDetails();
		}, 500);

		return () => clearTimeout(delayDebounce);
	}, [page, limit, search]);

	const getRequestListDetails = async () => {
		try {
			const response = await requestApi.getRequestList({
				page: page + 1, // backend is 1-based
				limit: limit,
				search,
			});

			if (response.status) {
				setRequestList(response.response.data.data || []);
				setTotal(response.response.data.totalRecords || 0);
			}
		} catch (error) {
			console.error(error);
			setRequestList([]);
		}
	};
	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setLimit(parseInt(e.target.value, 10));
		setPage(0); // reset page
	};
	const getCtegoryDetails = async () => {
		const response = await requestApi.getCategoryDetails();
		if (response.status) {
			setCategory(response?.response?.data);
		}
	};

	const handlePreviewRequest = (id: string) => {
		const req = requestList.find((r) => r._id === id);
		if (req) {
			setPreviewRequest(req);
			setPreviewDialogOpen(true);
		}
	};

	const handleImagePreview = (url: string) => {
		setPreviewImage(url);
		setPreviewOpen(true);
	};

	// Validation
	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!form.title) newErrors.title = "Title is required";
		if (!form.category) newErrors.category = "Project name is required";
		if (!form.donationLastDate) newErrors.donationLastDate = "Last Date is required";
		if (!form.usagePlan) newErrors.usagePlan = "Usage plan is required";
		if (!form.address) newErrors.address = "Address is required";
		if (!form.area) newErrors.area = "Area is required";
		if (!form.city) newErrors.city = "City is required";
		if (!form.state) newErrors.state = "State is required";
		if (!form.country) newErrors.country = "Country is required";

		if (form.totalDonation === "" || form.totalDonation === null || form.totalDonation === undefined) {
			newErrors.totalDonation = "Donation is required";
		} else if (Number(form.totalDonation) < 0) {
			newErrors.totalDonation = "Donation cannot be negative";
		}
		if (!form.pincode) {
			newErrors.pincode = "Pincode is required";
		} else if (!/^\d{6}$/.test(String(form.pincode))) {
			newErrors.pincode = "Pincode must be exactly 6 digits";
		}

		if (!form.contactNo) {
			newErrors.contactNo = "Contact No is required";
		} else if (!/^\d{10}$/.test(String(form.contactNo))) {
			newErrors.contactNo = "Contact No must be exactly 10 digits";
		}

		if (!form.photo) newErrors.photo = "Photo is required";
		if (!form.document) newErrors.document = "Document is required";
		if (!form.responsiblePerson) newErrors.responsiblePerson = "Responsible person is required";

		if (!form.contactNo) {
			newErrors.contactNo = "Contact No is required";
		} else if (!/^\d{10}$/.test(form.contactNo)) {
			newErrors.contactNo = "Contact No must be exactly 10 digits";
		}

		return newErrors;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		let newValue = value;

		switch (name) {
			case "totalDonation":
				newValue = Number(value) >= 0 ? value : "0";
				break;

			case "contactNo":
				// Allow only numbers, max 10 digits
				newValue = value.replace(/\D/g, "").slice(0, 10);
				break;

			case "pincode":
				// Allow only numbers, max 6 digits
				newValue = value.replace(/\D/g, "").slice(0, 6);
				break;

			case "area":
			case "city":
			case "responsiblePerson":
			case "country":
				// Allow only alphabets and spaces
				newValue = value.replace(/[^a-zA-Z\s]/g, "");
				break;

			default:
				break;
		}

		setForm({ ...form, [name]: newValue });
	};

	// Drag & Drop Handlers
	const onDropPhoto = (acceptedFiles: File[]) => {
		setErrors({});

		setForm({ ...form, photo: acceptedFiles[0] });
	};
	const onDropDocument = (acceptedFiles: File[]) => {
		setErrors({});

		setForm({ ...form, document: acceptedFiles[0] });
	};

	const { getRootProps: getPhotoRoot, getInputProps: getPhotoInput } = useDropzone({
		accept: { "image/*": [] },
		multiple: false,
		onDrop: onDropPhoto,
	});

	const { getRootProps: getDocRoot, getInputProps: getDocInput } = useDropzone({
		accept: {
			"application/pdf": [],
			"application/msword": [],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
		},
		multiple: false,
		onDrop: onDropDocument,
	});

	const handleSubmit = async () => {
		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("categoryId", form.category);
		formData.append("totalDonation", form.totalDonation.toString());
		formData.append("donationLastDate", form.donationLastDate);
		formData.append("usagePlan", form.usagePlan);
		formData.append("address", form.address);
		formData.append("area", form.area);
		formData.append("city", form.city);
		formData.append("state", form.state);
		formData.append("country", form.country);
		formData.append("responsiblePerson", form.responsiblePerson);
		formData.append("contactNo", form.contactNo);
		formData.append("pincode", form.pincode.toString());
		formData.append("status", form.status);

		// ✅ Only send new files, keep old ones untouched
		if (form.photo && form.photo instanceof File) {
			formData.append("photo", form.photo);
		}
		if (form.document && form.document instanceof File) {
			formData.append("document", form.document);
		}

		try {
			let response;
			if (isEditMode && editId) {
				response = await requestApi.updateRequest(editId, formData); // ✅ update
			} else {
				response = await requestApi.addRequest(formData); // ✅ add
			}

			if (response?.status && response?.response?.data) {
				const updatedData = response.response.data;

				if (isEditMode && editId) {
					// setRequestList(requestList.map((r: any) => (r._id === editId ? { ...r, ...updatedData } : r)));
					showSnackbar("Request updated successfully!", "success");
					setForm({
						id: 0,
						title: "",
						category: "",
						totalDonation: "",
						donationLastDate: "",
						usagePlan: "",
						address: "",
						area: "",
						city: "",
						state: "",
						country: "",
						pincode: "",
						photo: null,
						document: null,
						status: "pending",
						responsiblePerson: "",
						contactNo: "",
					});
					setErrors({});
					setOpen(false);
					setIsEditMode(false);
					setEditId(null);
					await getRequestListDetails();
				} else {
					// setRequestList([...requestList, updatedData]);
					showSnackbar("Request added successfully!", "success");
					setForm({
						id: 0,
						title: "",
						category: "",
						totalDonation: "",
						donationLastDate: "",
						usagePlan: "",
						address: "",
						area: "",
						city: "",
						state: "",
						country: "",
						pincode: "",
						photo: null,
						document: null,
						status: "pending",
						responsiblePerson: "",
						contactNo: "",
					});
					setErrors({});
					setOpen(false);
					setIsEditMode(false);
					setEditId(null);
					await getRequestListDetails();
				}
			} else {
				showSnackbar("Failed to submit request", "error");
			}
		} catch (error) {
			console.log(error);
			showSnackbar("Something went wrong", "error");
		}
	};

	const handleDelete = (id: string) => {
		setDeleteId(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!deleteId) return;
		const response = await requestApi.deleteRequest(deleteId);
		if (response.status) {
			showSnackbar("Request deleted successfully!", "success");
			setDeleteId(null);
			setDeleteDialogOpen(false);
			await getRequestListDetails();
		} else {
			showSnackbar("Failed to delete request", "error");
		}

		setDeleteDialogOpen(false);
		setDeleteId(null);
	};

	const cancelDelete = () => {
		setDeleteDialogOpen(false);
		setDeleteId(null);
	};

	const handleEdit = (id: string) => {
		const req: any = requestList.find((r: any) => r._id === id);
		if (req) {
			setForm({
				id: req._id,
				title: req.title,
				category: req.categoryId || "",
				totalDonation: req.totalDonation,
				donationLastDate: req.donationLastDate.split("T")[0],
				usagePlan: req.usagePlan,
				address: req.address,
				area: req.area,
				city: req.city,
				state: req.state,
				country: req.country,
				pincode: req.pincode,
				photo: req.photo?.[0] || null, // ✅ store existing file
				document: req.document?.[0] || null, // ✅ store existing file
				status: req.status || "pending",
				responsiblePerson: req.responsiblePerson || "",
				contactNo: req.contactNo || "",
			});
			setIsEditMode(true);
			setEditId(id);
			setOpen(true);
		}
	};

	const handleStatusChange = (id: number, status: string) => {
		setRequests(requests.map((req) => (req.id === id ? { ...req, status } : req)));
	};
	const handleApprove = async (id: any) => {
		try {
			const response = await requestApi.updateStaus(id, "approved");
			if (response.status) {
				showSnackbar("Request approved successfully!", "success");
				await getRequestListDetails();
				setPreviewDialogOpen(false);
				setPreviewRequest(null);
			}
		} catch (error) {
			console.error("Error approving request:", error);
			showSnackbar("Failed to approve request", "error");
		}
	};
	return (
		<Box>
			{/* Search + Add Button */}
			<Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
				Request List
			</Typography>
			<Box display="flex" justifyContent="space-between" mb={2}>
				<TextField
					placeholder="Search..."
					size="small"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0); // reset page when searching
					}}
				/>
				<Button
					variant="contained"
					onClick={() => setOpen(true)}
					sx={{
						backgroundColor: "#04566e",
						"&:hover": {
							backgroundColor: "#04566e",
						},
					}}
				>
					+ Add Request
				</Button>
			</Box>

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
							<TableRow>
								<TableCell sx={{ width: "70px" }}>S.No</TableCell>
								<TableCell sx={{ width: "200px" }}>Title</TableCell>
								<TableCell sx={{ width: "200px" }}>Category</TableCell>
								<TableCell sx={{ width: "200px" }}>Total Donation</TableCell>
								<TableCell sx={{ width: "300px" }}>Usage Plan</TableCell>
								<TableCell sx={{ width: "130px" }}>Last Date</TableCell>
								<TableCell sx={{ width: "140px" }}>Status</TableCell>
								<TableCell sx={{ width: "200px" }}>Photo</TableCell>
								<TableCell sx={{ width: "200px" }}>Document</TableCell>
								<TableCell sx={{ width: "200px" }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{requestList.map((req: any, index: number) => (
								<TableRow key={req._id}>
									<TableCell>{page * limit + index + 1}</TableCell>
									<TableCell>{req.title}</TableCell>
									<TableCell>{req.categoryName}</TableCell>
									<TableCell>{req.totalDonation}</TableCell>
									<TableCell
										sx={{
											width: "300px",
											whiteSpace: "normal", // ✅ allow wrapping
											wordBreak: "break-word", // ✅ break long words if needed
										}}
									>
										{req.usagePlan}
									</TableCell>
									<TableCell>{new Date(req.donationLastDate).toLocaleDateString()}</TableCell>
									<TableCell>
										<Typography
											sx={{
												color: req.status === "pending" ? "red" : req.status === "approved" ? "green" : "brown",
												fontWeight: "bold",
											}}
										>
											{req.status.charAt(0).toUpperCase() + req.status.slice(1)}
										</Typography>
									</TableCell>

									{/* Photo */}
									<TableCell>
										{req.photo?.length > 0 ? (
											<img
												src={req.photo[0].docPath}
												alt={req.photo[0].originalName}
												style={{ width: 60, height: 60, objectFit: "cover", cursor: "pointer" }}
												onClick={() => handleImagePreview(req.photo[0].docPath)}
											/>
										) : (
											"No Photo"
										)}
									</TableCell>

									{/* Document */}
									<TableCell>
										{req.document?.length > 0 ? (
											<Button
												variant="outlined"
												size="small"
												onClick={() => window.open(req.document[0].docPath, "_blank")}
											>
												Open Document
											</Button>
										) : (
											"No Document"
										)}
									</TableCell>

									<TableCell>
										<IconButton onClick={() => handlePreviewRequest(req._id)}>
											<VisibilityIcon />
										</IconButton>
										<IconButton onClick={() => handleEdit(req._id)}>
											<EditIcon />
										</IconButton>
										<IconButton onClick={() => handleDelete(req._id)}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Box>
			</Paper>
			{/* Pagination */}
			<TablePagination
				component="div"
				count={total}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={limit}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25, 50]}
			/>
			{/* Add Request Modal */}
			<Dialog
				open={open}
				onClose={() => {
					setOpen(false);
					setForm({
						id: 0,
						title: "",
						category: "",
						totalDonation: "",
						donationLastDate: "",
						usagePlan: "",
						address: "",
						area: "",
						city: "",
						state: "",
						country: "",
						pincode: "",
						photo: null,
						document: null,
						status: "pending",
						responsiblePerson: "",
						contactNo: "",
					});
					setEditId(null);
					setIsEditMode(false);
				}}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{isEditMode ? "Edit Request" : "Add Request"}</DialogTitle>
				<DialogContent
					sx={{
						overflow: "visible", // ⬅️ disable built-in scroll
					}}
				>
					<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
						<TextField
							label="Title"
							name="title"
							value={form.title}
							onChange={handleChange}
							error={!!errors.title}
							helperText={errors.title}
						/>
						<TextField
							select
							label="Category"
							name="category"
							value={form.category}
							onChange={handleChange}
							error={!!errors.category}
							helperText={errors.category}
						>
							{category.map((cat: any) => (
								<MenuItem key={cat._id} value={cat._id}>
									{cat.categoryName}
								</MenuItem>
							))}
						</TextField>

						<TextField
							label="Total Donation Required"
							name="totalDonation"
							type="number"
							value={form.totalDonation}
							onChange={handleChange}
							error={!!errors.totalDonation}
							helperText={errors.totalDonation}
						/>
						<TextField
							label="Donation Last Date"
							name="donationLastDate"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={form.donationLastDate}
							onChange={handleChange}
							error={!!errors.donationLastDate}
							helperText={errors.donationLastDate}
						/>
						<TextField
							label="Usage Plan"
							name="usagePlan"
							value={form.usagePlan}
							onChange={handleChange}
							error={!!errors.usagePlan}
							helperText={errors.usagePlan}
						/>
						<TextField
							label="Responsible Person"
							name="responsiblePerson"
							value={form.responsiblePerson}
							onChange={handleChange}
							error={!!errors.responsiblePerson}
							helperText={errors.responsiblePerson}
						/>
						<TextField
							label="Contact Number"
							name="contactNo"
							value={form.contactNo}
							onChange={handleChange}
							error={!!errors.contactNo}
							helperText={errors.contactNo}
						/>
						<TextField
							label="Address"
							name="address"
							value={form.address}
							onChange={handleChange}
							error={!!errors.address}
							helperText={errors.address}
						/>
						<TextField
							label="Area"
							name="area"
							value={form.area}
							onChange={handleChange}
							error={!!errors.area}
							helperText={errors.area}
						/>
						<TextField
							label="City"
							name="city"
							value={form.city}
							onChange={handleChange}
							error={!!errors.city}
							helperText={errors.city}
						/>
						<TextField
							label="State"
							name="state"
							value={form.state}
							onChange={handleChange}
							error={!!errors.state}
							helperText={errors.state}
						/>
						<TextField
							label="Country"
							name="country"
							value={form.country}
							onChange={handleChange}
							error={!!errors.country}
							helperText={errors.country}
						/>
						<TextField
							label="Pincode"
							name="pincode"
							value={form.pincode}
							onChange={handleChange}
							error={!!errors.pincode}
							helperText={errors.pincode}
						/>

						{/* Photo Upload */}
						<Box>
							<Paper
								{...getPhotoRoot()}
								sx={{ p: 2, border: "2px dashed gray", textAlign: "center", cursor: "pointer" }}
							>
								<input {...getPhotoInput()} name="photo" />
								{form.photo ? (
									typeof form.photo === "object" && "docPath" in form.photo ? (
										<img
											src={form.photo.docPath}
											alt={form.photo.originalName}
											style={{ maxWidth: "100px", maxHeight: "100px" }}
										/>
									) : (
										<Typography>{(form.photo as File).name}</Typography>
									)
								) : (
									<Typography>Drag & drop photo, or click to select</Typography>
								)}
							</Paper>
							{errors.photo && (
								<Typography color="error" variant="caption">
									{errors.photo}
								</Typography>
							)}
						</Box>

						{/* Document Upload */}
						<Box>
							<Paper {...getDocRoot()} sx={{ p: 2, border: "2px dashed gray", textAlign: "center", cursor: "pointer" }}>
								<input {...getDocInput()} name="document" />
								{form.document ? (
									// Check if it's an existing document object
									typeof form.document === "object" && "docPath" in form.document ? (
										<Button
											variant="outlined"
											size="small"
											// onClick={() => window.open(form.document?.docPath, "_blank")}
										>
											{form.document?.originalName}
										</Button>
									) : (
										// It's a File
										<Typography>{(form.document as File)?.name}</Typography>
									)
								) : (
									<Typography>Drag & drop document, or click to select</Typography>
								)}
							</Paper>
							{errors.document && (
								<Typography color="error" variant="caption">
									{errors.document}
								</Typography>
							)}
						</Box>

						{/* Status dropdown only in edit mode */}
						{isEditMode && (
							<TextField
								select
								label="Status"
								name="status"
								value={form.status}
								onChange={(e) => setForm({ ...form, status: e.target.value })}
								fullWidth
								sx={{ mt: 2 }}
							>
								<MenuItem value="pending">Pending</MenuItem>
								<MenuItem value="approved">Approved</MenuItem>
								<MenuItem value="rejected">Rejected</MenuItem>
							</TextField>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setOpen(false),
								setForm({
									id: 0,
									title: "",
									category: "",
									totalDonation: "",
									donationLastDate: "",
									usagePlan: "",
									address: "",
									area: "",
									city: "",
									state: "",
									country: "",
									pincode: "",
									photo: null,
									document: null,
									status: "pending",
									responsiblePerson: "",
									contactNo: "",
								});
						}}
					>
						Cancel
					</Button>
					<Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#04566e" }}>
						{isEditMode ? "Update" : "Submit"}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Request Details</DialogTitle>
				<DialogContent>
					{previewRequest && (
						<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
							<Typography>
								<strong>Title:</strong> {previewRequest.title}
							</Typography>
							<Typography>
								<strong>Category:</strong> {previewRequest.categoryName}
							</Typography>
							<Typography>
								<strong>Total Donation:</strong> {previewRequest.totalDonation}
							</Typography>
							<Typography>
								<strong>Donation Last Date:</strong> {new Date(previewRequest.donationLastDate).toLocaleDateString()}
							</Typography>
							<Typography>
								<strong>Usage Plan:</strong> {previewRequest.usagePlan}
							</Typography>
							<Typography>
								<strong>Address:</strong> {previewRequest.address}
							</Typography>
							<Typography>
								<strong>Area:</strong> {previewRequest.area}
							</Typography>
							<Typography>
								<strong>City:</strong> {previewRequest.city}
							</Typography>
							<Typography>
								<strong>State:</strong> {previewRequest.state}
							</Typography>
							<Typography>
								<strong>Country:</strong> {previewRequest.country}
							</Typography>
							<Typography>
								<strong>Pincode:</strong> {previewRequest.pincode}
							</Typography>
							<Typography>
								<strong>Status:</strong> {previewRequest.status}
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					{/* ✅ Approve Button */}
					{previewRequest?.status !== "approved" && (
						<Button
							variant="contained"
							color="success"
							onClick={() => handleApprove(previewRequest?._id!)}
							disabled={!previewRequest}
						>
							Approve
						</Button>
					)}
					<Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: { background: "transparent", boxShadow: "none" },
				}}
			>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					sx={{
						backdropFilter: "blur(8px)", // blur background
						height: "100%",
					}}
				>
					<img
						src={previewImage || ""}
						alt="Preview"
						style={{ maxWidth: "90%", maxHeight: "80vh", borderRadius: "8px" }}
					/>
				</Box>
			</Dialog>

			<Dialog open={deleteDialogOpen} onClose={cancelDelete}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this record?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={cancelDelete} sx={{ color: "#04566e" }}>
						Cancel
					</Button>
					<Button onClick={confirmDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
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

export default RequestPage;
