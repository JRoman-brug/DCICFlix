export interface User {
  id: string;
  email: string;
}

//api-gateway response when a user is loging
export interface AuthResponse {
  id: string;
  email: string;
  token: string;
  message: string;
}
