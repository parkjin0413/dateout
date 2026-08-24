"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

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
    <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#E7E2D2] bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,92,86,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,92,86,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 text-center p-6">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E3EFEC] border border-[#CFE3E0] mb-6"
        >
          <BoltIcon className="h-4 w-4 text-[#0F5C56]" />
          <span className="text-sm font-medium text-[#0F5C56]">
            강산이엔지 업무지원 시스템
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 text-[#211D14]"
        >
          KANGSAN WORK
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg text-[#6B6455] mb-10"
        >
          외근계획표부터 연간 일정, 개별 업무보고까지. 강산이엔지 임직원을 위한 업무 도구를
          한 곳에 모았습니다.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <Link
            href="/auth"
            className="px-8 py-4 bg-[#0F5C56] text-white font-semibold rounded-lg shadow-lg shadow-[#0F5C56]/15 hover:bg-[#0C4A45] transition-colors duration-300 inline-flex items-center gap-2 mx-auto"
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
