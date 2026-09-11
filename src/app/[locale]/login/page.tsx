import { getCurrentUserServer } from "@/features/auth/auth.server";
import { redirect } from "next/navigation";
import { LoginPageContent } from "@/features/auth/LoginPageContent";

type LocalizedLoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalizedLoginPage({
  params,
}: LocalizedLoginPageProps) {
  const { locale } = await params;
  const user = await getCurrentUserServer();
  if (user)
    redirect(
      user.mustChangePassword
        ? `/${locale}/change-password`
        : user.role === "ADMIN"
          ? "/admin"
          : `/${locale}/${user.role === "JUDGE" ? "judge" : "athlete"}`,
    );

  return (
    <LoginPageContent
      showLocaleSwitcher
      judgeDestination={`/${locale}/judge`}
      athleteDestination={`/${locale}/athlete`}
    />
  );
}
