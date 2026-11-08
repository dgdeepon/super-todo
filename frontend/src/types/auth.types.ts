export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiSuccess<T> {
  status: true;
  message: string;
  data: T;
}

export interface ApiError {
  status: false;
  message: string;
  data: Record<string, unknown>;
}
