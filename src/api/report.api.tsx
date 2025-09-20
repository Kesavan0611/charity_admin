// src/api/user.api.ts
import { apiClient } from "../network/index";

class reportApi {
	async getPaymentHistoryByUser(input: any) {
		try {
			const response = await apiClient.get(`/v1/donation/payments/history`, { params: input });
			console.log(response, "response");
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
	async getRequestDetails(input: any) {
		try {
			const response = await apiClient.get(`/v1/donation/requestPayments/history`, { params: input });
			console.log(response, "response");
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

const userApi = new reportApi();
export default userApi;
