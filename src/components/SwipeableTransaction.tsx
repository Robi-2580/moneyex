import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';

interface SwipeableTransactionProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SwipeableTransaction({ children, onEdit, onDelete }: SwipeableTransactionProps) {
  const x = useMotionValue(0);
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editOpacity = useTransform(x, [0, 80], [0, 1]);
  const deleteOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 70;
    if (info.offset.x > threshold) {
      setSwiped('right');
      setTimeout(() => { onEdit(); setSwiped(null); }, 200);
    } else if (info.offset.x < -threshold) {
      setSwiped('left');
      setTimeout(() => { onDelete(); setSwiped(null); }, 200);
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
      {/* Edit background (swipe right) */}
      <motion.div
        style={{ opacity: editOpacity }}
        className="absolute inset-0 bg-primary flex items-center pl-5 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-primary-foreground font-semibold text-sm">
          <Pencil size={18} />
          <span>Edit</span>
        </div>
      </motion.div>

      {/* Delete background (swipe left) */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-destructive flex items-center justify-end pr-5 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span>Delete</span>
          <Trash2 size={18} />
        </div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={swiped === 'right' ? { x: 200 } : swiped === 'left' ? { x: -200 } : { x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
