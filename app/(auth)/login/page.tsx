import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { RedirectIfAuth } from "@/components/auth/AuthGuard";

export default function LoginPage() {
  return (
    <RedirectIfAuth>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </RedirectIfAuth>
  );
}
