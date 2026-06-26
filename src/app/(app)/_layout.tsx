import { useEffect } from "react";
import { router, Slot } from "expo-router";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentToken } from "@/redux/features/auth/authSlice";

/**
 * Protected App Layout — wraps authenticated screens.
 * Redirects to login if no token.
 * (tabs)/ sub-group handles the tab navigator.
 */
export default function AppLayout() {
  // const token = useAppSelector(selectCurrentToken);
  const token = true;

  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token]);

  if (!token) return null;

  return <Slot />;
}
