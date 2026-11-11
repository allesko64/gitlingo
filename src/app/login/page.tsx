import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/layout/Container";
import { AppTopBar } from "@/components/lesson/AppTopBar";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Git Lingo to keep your progress across every browser.",
};

export default function LoginPage() {
  return (
    <>
      <AppTopBar />
      <main className="flex flex-1 flex-col justify-center pt-32 pb-24">
        <Container>
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}
