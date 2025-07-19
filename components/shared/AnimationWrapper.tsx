"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

interface AnimationWrapperProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for more natural feel
    }
  }
};

export function AnimationWrapper({ children, className = "", ...motionProps }: AnimationWrapperProps) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}