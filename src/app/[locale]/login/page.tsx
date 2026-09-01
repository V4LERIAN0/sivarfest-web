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

  return (
    <LoginPageContent
      showLocaleSwitcher
      judgeDestination={`/${locale}/judge`}
    />
  );
}