'use client';

import type { FC, ReactNode } from 'react';

import { motion } from 'framer-motion';

import { staggerContainerVariants } from '@/config/animations';

interface AnimatedGridProps {
  children: ReactNode,
  className?: string,
}

export const AnimatedGrid: FC<AnimatedGridProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      animate="visible"
      className={className}
      initial="hidden"
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
};
