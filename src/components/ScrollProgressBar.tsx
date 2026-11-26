import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgressBar() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[60] h-[3px] pointer-events-none bg-white/5"
    >
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-[#397BFF] via-[#606BFF] to-[#8555FF] shadow-[0_0_10px_rgba(57,123,255,0.65)]"
        style={{
          scaleX: prefersReducedMotion ? scrollYProgress : smoothProgress,
        }}
      />
    </div>
  );
}
