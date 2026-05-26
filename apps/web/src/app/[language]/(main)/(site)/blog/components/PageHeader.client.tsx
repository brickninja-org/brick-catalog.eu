'use client';

import { Typography } from '@heroui/react';
import { motion } from 'framer-motion';

import { fadeInUpVariants } from '@/config/animations';

interface BlogPageHeaderProps {
  title: string,
  description: string,
}

export function BlogPageHeader({ title, description }: BlogPageHeaderProps) {
  return (
    <motion.div
      animate="visible"
      className="flex flex-col gap-2"
      initial="hidden"
      variants={fadeInUpVariants}
    >
      <Typography type="h1">{title}</Typography>
      <Typography className="text-muted" type="body">{description}</Typography>
    </motion.div>
  );
}
