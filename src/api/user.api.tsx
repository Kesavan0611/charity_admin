// src/api/user.api.ts
import { apiClient } from "../network/index";

class UserApi {
  async addUser(input: FormData) {
    try {
      const response = await apiClient.post("/v1/user/add-user", input);
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error adding user:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }
    async getUser(input:any) {
    try {
      const response = await apiClient.get("/v1/user/get-alluser",{
        params:input
      });
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error adding user:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }

  async updateUser(id:any,input: FormData) {
    try {
      const response = await apiClient.put(`/v1/users/edit-user/${id}`,input);
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error updating user:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }

  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const response = await apiClient.get("/users/get-users", {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search || "",
        },
      });
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }

  async deleteUser(id: any) {
    try {
      const response = await apiClient.delete(`/v1/user/delete-user/${id}`);
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }
  async approveStatus(id: any,input:any) {
    try {
      const response = await apiClient.patch(`/v1/user/update-status/${id}`,input);
      return { status: response.status, data: response.data };
    } catch (error: any) {
      console.error("Error deleting user:", error);
      return {
        status: error.response?.status || 500,
        error: error.response?.data?.message || "Something went wrong",
      };
    }
  }
}

const userApi = new UserApi();
export default userApi;
