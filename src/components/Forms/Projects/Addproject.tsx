"use client";

import React, { useEffect, useState } from "react";
import projectApi from "@/api/project.api";
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

// ---------------- Types ----------------
interface ProjectData {
	id: number | string;
	projectTitle: string;
	location: string;
	// expectation: string;
	description: string;
	// goal: string;
	responsiblePerson: string;
	contactNo: string;
	// category?: string;
	startDateTime: string;
	endDateTime: string;
}

interface ProjectItem {
	_id: string;
	projectTitle: string;
	location: string;
	// expectation: string;
	description: string;
	// goal: string;
	responsiblePerson: string;
	contactNo: string;
	categoryName?: string;
	image?: { docPath: string; originalName: string }[];
	document?: { docPath: string; originalName: string }[];
	startDateTime: string;
	endDateTime: string;
}

// ---------------- Component ----------------
const ProjectPage: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [projectList, setProjectList] = useState<ProjectItem[]>([]);
	const [form, setForm] = useState<ProjectData>({
		id: 0,
		projectTitle: "",
		location: "",
		// expectation: "",
		description: "",
		// goal: "",
		responsiblePerson: "",
		contactNo: "",
		// category: "",
		startDateTime: "",
		endDateTime: "",
	});
	const [category, setCategory] = useState<{ _id: string; name: string }[]>([]);
	const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isEditMode, setIsEditMode] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(5);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState("");

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

	// ---------------- Hooks ----------------
	useEffect(() => {
		// getProjectListDetails();
		// getCategoryDetails();

		const delayDebounce = setTimeout(() => {
			getProjectListDetails();
		}, 500);

		return () => clearTimeout(delayDebounce);
	}, [page, limit, search]);

	const getProjectListDetails = async () => {
		const response = await projectApi.getProjectList({
			page: page + 1, // backend is 1-based
			limit,
			search,
		});

		if (response.status) {
			setProjectList(response.response.data.data || []);
			setTotal(response.response.data.total || 0);
		}
	};

	const getCategoryDetails = async () => {
		const response = await projectApi.getCategoryDetails();
		if (response.status) {
			setCategory(response.response.data);
		}
	};

	// ---------------- Preview ----------------
	const handlePreviewProject = (id: string) => {
		const project = projectList.find((r) => r._id === id);
		if (project) {
			setPreviewProject(project);
			setPreviewDialogOpen(true);
		}
	};

	const handleImagePreview = (url: string) => {
		setPreviewImage(url);
		setPreviewOpen(true);
	};

	// ---------------- Validation ----------------
	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};
		if (!form.projectTitle) newErrors.projectTitle = "Camp title is required";
		if (!form.location) newErrors.location = "Location is required";
		// if (!form.expectation) newErrors.expectation = "Expectation is required";
		if (!form.description) newErrors.description = "Description is required";
		// if (!form.goal) newErrors.goal = "Goal is required";
		if (!form.responsiblePerson) newErrors.responsiblePerson = "Responsible Person is required";
		if (!form.contactNo) {
			newErrors.contactNo = "Contact No is required";
		} else if (!/^\d{10}$/.test(String(form.contactNo))) {
			newErrors.contactNo = "Contact No must be exactly 10 digits";
		}
		if (!form.startDateTime) newErrors.startDateTime = "Start Date and time is required"; // Add validation
		if (!form.endDateTime) newErrors.endDateTime = "End Date and time is required"; // Add validation

		return newErrors;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		let newValue = value;

		switch (name) {
			case "responsiblePerson":
				// Allow only alphabets and spaces
				newValue = value.replace(/[^a-zA-Z\s]/g, "");
				break;

			case "contactNo":
				// Allow only numbers and max 10 digits
				newValue = value.replace(/\D/g, "").slice(0, 10);
				break;

			default:
				break;
		}

		setForm({ ...form, [name]: newValue });
	};

	// ---------------- Submit ----------------
	const handleSubmit = async () => {
		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		const formData = new FormData();
		Object.entries(form).forEach(([key, value]) => {
			if (value) formData.append(key, value.toString());
		});
		console.log([...formData], "responseee");
		try {
			let response;
			if (isEditMode && editId) {
				response = await projectApi.updateProject(editId, formData);
			} else {
				response = await projectApi.addProject(formData);
			}

			if (response?.status && response?.response?.data) {
				showSnackbar(isEditMode ? "Camp updated successfully!" : "Camp added successfully!", "success");
				setForm({
					id: 0,
					projectTitle: "",
					location: "",
					description: "",
					responsiblePerson: "",
					contactNo: "",
					startDateTime: "",
					endDateTime: "",
				});
				setErrors({});
				setOpen(false);
				setIsEditMode(false);
				setEditId(null);
				getProjectListDetails();
			} else {
				showSnackbar("Failed to submit project", "error");
			}
		} catch (error) {
			console.log(error);
			showSnackbar("Something went wrong", "error");
		}
	};

	// ----------------- Edit ---------------

	const handleEdit = (id: string) => {
		const req: any = projectList.find((r: any) => r._id === id);
		if (req) {
			setForm({
				id: req._id,
				projectTitle: req.projectTitle,
				location: req.location,
				description: req.description,
				responsiblePerson: req.responsiblePerson,
				contactNo: req.contactNo,
				startDateTime: req.startDateTime ? new Date(req.startDateTime).toISOString().slice(0, 16) : "",
				endDateTime: req.endDateTime ? new Date(req.endDateTime).toISOString().slice(0, 16) : "",
			});
			setIsEditMode(true);
			setEditId(id);
			setOpen(true);
		}
	};

	// ---------------- Delete ----------------
	const handleDelete = (id: string) => {
		setDeleteId(id);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!deleteId) return;
		const response = await projectApi.deleteProject(deleteId);
		if (response.status) {
			showSnackbar("Camp deleted successfully!", "success");
			getProjectListDetails();
		} else {
			showSnackbar("Failed to delete Camp", "error");
		}
		setDeleteDialogOpen(false);
		setDeleteId(null);
	};

	const cancelDelete = () => {
		setDeleteDialogOpen(false);
		setDeleteId(null);
	};

	// ---------------- Pagination ----------------
	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLimit(parseInt(e.target.value, 10));
		setPage(0);
	};

	return (
		<Box>
			<Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
				Camp List
			</Typography>
			{/* Search & Add */}
			<Box display="flex" justifyContent="space-between" mb={2}>
				<TextField
					placeholder="Search..."
					size="small"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0);
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
					+ Add Camps
				</Button>
			</Box>

			{/* Table */}
			<Paper>
				<Table>
					<TableHead>
						<TableRow>
							{["S.No", "Camp Title", "Res-Person", "Location", "Description", "ContactNo", "Actions"].map((head) => (
								<TableCell key={head} sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
									{head}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{projectList.map((req, index) => (
							<TableRow key={req._id}>
								<TableCell>{page * limit + index + 1}</TableCell>
								<TableCell>{req.projectTitle}</TableCell>
								<TableCell>{req.responsiblePerson || "-"}</TableCell>
								<TableCell>{req.location}</TableCell>
								<TableCell>{req.description}</TableCell>
								<TableCell>{req.contactNo}</TableCell>
								<TableCell>
									<IconButton onClick={() => handlePreviewProject(req._id)}>
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

				<TablePagination
					component="div"
					count={total}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={limit}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
				/>
			</Paper>

			{/* Add/Edit Modal */}
			<Dialog
				open={open}
				onClose={() => {
					setOpen(false);
					setForm({
						id: 0,
						projectTitle: "",
						location: "",
						description: "",
						responsiblePerson: "",
						contactNo: "",
						startDateTime: "",
						endDateTime: "",
					});
				}}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>{isEditMode ? "Edit Camp" : "Add Camp"}</DialogTitle>
				<DialogContent>
					<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={1}>
						<TextField
							label="Camp Title"
							name="projectTitle"
							value={form.projectTitle}
							onChange={handleChange}
							error={!!errors.projectTitle}
							helperText={errors.projectTitle}
						/>
						<TextField
							label="Location"
							name="location"
							value={form.location}
							onChange={handleChange}
							error={!!errors.location}
							helperText={errors.location}
						/>
						{/* <TextField label="Expectation" name="expectation" value={form.expectation} onChange={handleChange} error={!!errors.expectation} helperText={errors.expectation} /> */}
						<TextField
							label="Description"
							name="description"
							value={form.description}
							onChange={handleChange}
							error={!!errors.description}
							helperText={errors.description}
						/>
						{/* <TextField label="Goal" name="goal" value={form.goal} onChange={handleChange} error={!!errors.goal} helperText={errors.goal} /> */}
						<TextField
							label="Responsible Person"
							name="responsiblePerson"
							value={form.responsiblePerson}
							onChange={handleChange}
							error={!!errors.responsiblePerson}
							helperText={errors.responsiblePerson}
						/>
						<TextField
							label="Start Date & Time"
							name="startDateTime"
							type="datetime-local"
							value={form.startDateTime}
							onChange={handleChange}
							error={!!errors.startDateTime}
							helperText={errors.startDateTime}
							InputLabelProps={{
								shrink: true,
							}}
						/>
						<TextField
							label="End Date & Time"
							name="endDateTime"
							type="datetime-local"
							value={form.endDateTime}
							onChange={handleChange}
							error={!!errors.endDateTime}
							helperText={errors.endDateTime}
							InputLabelProps={{
								shrink: true,
							}}
						/>
						<TextField
							label="Contact Number"
							name="contactNo"
							value={form.contactNo}
							onChange={handleChange}
							error={!!errors.contactNo}
							helperText={errors.contactNo}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleSubmit}>
						{isEditMode ? "Update" : "Submit"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Preview Modal */}
			<Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>Camp Details</DialogTitle>
				<DialogContent>
					{previewProject && (
						<Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
							<Typography>
								<strong>Camp Title:</strong> {previewProject.projectTitle}
							</Typography>
							<Typography>
								<strong>Location:</strong> {previewProject.location}
							</Typography>
							{/* <Typography><strong>Expectation:</strong> {previewProject.expectation}</Typography> */}
							<Typography>
								<strong>Description:</strong> {previewProject.description}
							</Typography>
							{/* <Typography><strong>Goal:</strong> {previewProject.goal}</Typography> */}
							<Typography>
								<strong>Responsible Person:</strong> {previewProject.responsiblePerson}
							</Typography>
							<Typography>
								<strong>Contact Number:</strong> {previewProject.contactNo}
							</Typography>
							<Typography>
								<strong>Start Date & Time:</strong>{" "}
								{previewProject.startDateTime ? new Date(previewProject.startDateTime).toLocaleString() : "-"}
							</Typography>{" "}
							<Typography>
								<strong>End Date & Time:</strong>{" "}
								{previewProject.endDateTime ? new Date(previewProject.endDateTime).toLocaleString() : "-"}
							</Typography>{" "}
							{/* Add this line */}
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Modal */}
			<Dialog open={deleteDialogOpen} onClose={cancelDelete}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this record?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={cancelDelete}>Cancel</Button>
					<Button onClick={confirmDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Image Preview Modal */}
			<Dialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{ sx: { background: "transparent", boxShadow: "none" } }}
			>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					sx={{ backdropFilter: "blur(8px)", height: "100%" }}
				>
					<img
						src={previewImage || ""}
						alt="Preview"
						style={{ maxWidth: "90%", maxHeight: "80vh", borderRadius: "8px" }}
					/>
				</Box>
			</Dialog>

			{/* Snackbar */}
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
};

export default ProjectPage;
