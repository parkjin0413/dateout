"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

import ParticleBackground from "@/components/common/particle-background";
import { ArrowRightIcon } from "@/components/common/icons";

const BoltIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
);

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: "easeInOut",
    },
  }),
};

const Hero = () => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 text-center p-6">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 backdrop-blur-sm"
        >
          <BoltIcon className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">
            강산이엔지 업무지원 시스템
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        >
          KANGSAN WORK
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg text-gray-400 mb-10"
        >
          외근계획표부터 연간 일정, 개별 업무보고까지. 강산이엔지 임직원을 위한 업무 도구를
          한 곳에 모았습니다.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <Link
            href="/auth"
            className="px-8 py-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300 inline-flex items-center gap-2 mx-auto"
          >
            업무 도구 살펴보기
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
