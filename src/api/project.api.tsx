// src/api/user.api.ts
import { apiClient } from "../network/index";

class projectApi {
	async addProject(input: any) {
		try {
			const response = await apiClient.post(`/v1/project/add-project`, input);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: true,
				};
			}
		} catch (error) {
			//   ShowNotifications.showAxiosErrorAlert(error)
			return {
				response: null,
				status: false,
			};
		}
	}

	async getCategoryDetails() {
		try {
			const response = await apiClient.get(`/v1/category/categories`);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: true,
				};
			}
		} catch (error) {
			//   ShowNotifications.showAxiosErrorAlert(error)
			return {
				response: null,
				status: false,
			};
		}
	}
	async getProjectList(input:any) {
		console.log(input,"input")
		try {
			const response = await apiClient.get(`/v1/project/projectList`,{
				params:input
			});
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: true,
				};
			}
		} catch (error) {
			//   ShowNotifications.showAxiosErrorAlert(error)
			return {
				response: null,
				status: false,
			};
		}
	}
	async deleteProject(id: any) {
		try {
			const response = await apiClient.delete(`/v1/project/${id}`);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: true,
				};
			}
		} catch (error) {
			//   ShowNotifications.showAxiosErrorAlert(error)
			return {
				response: null,
				status: false,
			};
		}
	}
	async updateProject(id: any, data: any) {
		try {
			const response = await apiClient.put(`/v1/project/${id}`, data);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: true,
				};
			}
		} catch (error) {
			//   ShowNotifications.showAxiosErrorAlert(error)
			return {
				response: null,
				status: false,
			};
		}
	}
}

const userApi = new projectApi();
export default userApi;
