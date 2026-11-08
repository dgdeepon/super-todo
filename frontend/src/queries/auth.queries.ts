import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth.api";
import { LoginPayload, RegisterPayload } from "@/types/auth.types";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, logout } from "@/store/authSlice";

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response) => {
      if (response?.data?.token && response?.data?.user) {
        dispatch(
          setCredentials({
            token: response.data.token,
            user: response.data.user,
          })
        );
        router.push("/");
      }
    },
  });
};

export const useRegisterMutation = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (response) => {
      if (response?.data?.token && response?.data?.user) {
        dispatch(
          setCredentials({
            token: response.data.token,
            user: response.data.user,
          })
        );
        router.push("/");
      }
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await authApi.logout();
    dispatch(logout());
    queryClient.clear();
    router.push("/login");
  };
};
