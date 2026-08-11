"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

import ParticleBackground from "@/components/common/particle-background";
import { createClient } from "@/lib/supabase/client";
import logo from "@/public/logo2.png";

const EMAIL_DOMAIN = "ks.com";

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
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedId = id.trim().toLowerCase();
    if (!trimmedId || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${trimmedId}@${EMAIL_DOMAIN}`,
      password,
    });

    if (signInError) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        <Image src={logo} alt="강산 업무지원" priority className="mx-auto mb-8 h-8 w-auto" />

        <h1 className="mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          로그인
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          강산이엔지 업무지원 시스템에 오신 것을 환영합니다
        </p>

        <form onSubmit={handleSignIn} className="space-y-4 text-left">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">아이디</label>
            <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors focus-within:border-purple-400/50">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="9413"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-white outline-none placeholder:text-gray-600"
              />
              <span className="shrink-0 pr-3 text-base text-gray-500">@{EMAIL_DOMAIN}</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none transition-colors focus:border-purple-400/50"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-white px-6 py-3 font-semibold text-black shadow-lg transition-colors duration-300 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
