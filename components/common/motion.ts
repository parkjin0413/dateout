import type { Variants } from "framer-motion";

export const createFadeUpVariants = ({
  delayStep = 0.15,
  delayOffset = 0.2,
  duration = 0.6,
}: {
  delayStep?: number;
  delayOffset?: number;
  duration?: number;
} = {}): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * delayStep + delayOffset,
      duration,
      ease: "easeInOut",
    },
  }),
});
