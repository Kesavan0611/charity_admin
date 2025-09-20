import { apiClient } from "../network/index";

class RequestApi {
	async addRequest(input: any) {
		try {
			const response = await apiClient.post(`/v1/request/add-request`, input);
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
	async getRequestList(input: any) {
		try {
			const response = await apiClient.get(`/v1/request/requestList`, {
				params: input,
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
	async deleteRequest(id: any) {
		try {
			const response = await apiClient.delete(`/v1/request/${id}`);
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
	async updateStaus(id: any, status: string) {
		try {
			const response = await apiClient.put(`/v1/request/${id}/${status}`);
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
	async updateRequest(id: any, data: any) {
		try {
			const response = await apiClient.put(`/v1/request/${id}`, data);
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
	async getCardDetails() {
		try {
			const response = await apiClient.get(`/v1/dashboard/cardsData`);
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
	async getRequestCamp() {
		try {
			const response = await apiClient.get(`/v1/dashboard/requestandprojectMonth`);
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
	async getCategoryRequest() {
		try {
			const response = await apiClient.get(`/v1/dashboard/category-request`);
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

	async getNotifications() {
		try {
			const response = await apiClient.get(`/v1/dashboard/notifications`);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: false,
				};
			}
		} catch (error) {
			return {
				response: null,
				status: false,
			};
		}
	}

	async markNotificationsAsRead(data: { notificationIds: string[] }) {
		try {
			const response = await apiClient.put(`/v1/dashboard/notifications/read`, data);
			if (response.status == 200 || response.status == 201) {
				return {
					response: response.data,
					status: true,
				};
			} else {
				return {
					response: null,
					status: false,
				};
			}
		} catch (error) {
			return {
				response: null,
				status: false,
			};
		}
	}
}

const requestApi = new RequestApi();

export default requestApi;
