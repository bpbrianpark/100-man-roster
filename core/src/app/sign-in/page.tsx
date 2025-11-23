import { Suspense } from "react";
import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
