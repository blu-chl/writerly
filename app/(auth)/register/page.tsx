import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { RedirectIfAuth } from "@/components/auth/AuthGuard";

export default function RegisterPage() {
  return (
    <RedirectIfAuth>
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </RedirectIfAuth>
  );
}
