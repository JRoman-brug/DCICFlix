import axios from "axios";

interface BackendErrorResponse {
  message: string;
  statusCode?: number;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendErrorResponse;

    if (data && data.message) {
      return data.message;
    }

    if (error.response?.status === 401)
      return "Unauthorized. Please log in again.";
    if (error.response?.status === 403)
      return "Forbidden. You do not have permission to perform this action.";
    if (error.response?.status === 404) return "Resource not found.";
    if (error.response?.status === 500)
      return "Internal Server Error. Please contact support.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};
