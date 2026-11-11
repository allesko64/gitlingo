import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/layout/Container";
import { AppTopBar } from "@/components/lesson/AppTopBar";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Git Lingo account to save your progress across every browser.",
};

export default function SignupPage() {
  return (
    <>
      <AppTopBar />
      <main className="flex flex-1 flex-col justify-center pt-32 pb-24">
        <Container>
          <Suspense>
            <AuthForm mode="signup" />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}
