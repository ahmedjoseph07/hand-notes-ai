import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="auth-wrapper">
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
