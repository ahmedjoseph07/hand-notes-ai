import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="auth-wrapper">
      <Suspense>
        <SignUp />
      </Suspense>
    </main>
  );
}
