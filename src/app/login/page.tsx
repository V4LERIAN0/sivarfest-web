import { getCurrentUserServer } from "@/features/auth/auth.server";
import { redirect } from "next/navigation";
import { LoginPageContent } from "@/features/auth/LoginPageContent";

export default async function LoginPage() {
  const user = await getCurrentUserServer();
  if (user)
    redirect(
      user.mustChangePassword
        ? "/es/change-password"
        : user.role === "ADMIN"
          ? "/admin"
          : user.role === "JUDGE"
            ? "/es/judge"
            : "/es/athlete",
    );
  return (
    <LoginPageContent
      showLocaleSwitcher={false}
      judgeDestination="/judge"
      athleteDestination="/es/athlete"
    />
  );
}
