import { LoginPageContent } from "@/features/auth/LoginPageContent";

export default function LoginPage() {
  return (
    <LoginPageContent
      showLocaleSwitcher={false}
      judgeDestination="/judge"
      athleteDestination="/"
    />
  );
}
