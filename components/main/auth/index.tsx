"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

import ParticleBackground from "@/components/common/particle-background";
import { createClient } from "@/lib/supabase/client";
import logo from "@/public/logo.png";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
    />
  </svg>
);

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15 + 0.2,
      duration: 0.6,
      ease: "easeInOut",
    },
  }),
};

const Auth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError("Google 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
      <ParticleBackground />

      <motion.div
        custom={0}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-md"
      >
        <Image src={logo} alt="KANGSAN WORK" priority className="mx-auto mb-8 h-8 w-auto" />

        <h1 className="mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          로그인
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          강산이엔지 업무지원 시스템에 오신 것을 환영합니다
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-lg transition-colors duration-300 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <GoogleIcon className="h-5 w-5" />
          {isSubmitting ? "이동 중..." : "Google로 계속하기"}
        </button>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </motion.div>
    </div>
  );
};

export default Auth;
