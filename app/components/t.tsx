"use client"

import { motion } from "framer-motion";

export default function FallingBlocks() {
  // Define an array of blocks.
  // Instead of a fixed delay, we include a baseDelay for each block.
  // We will subtract a random offset (within the duration) from this baseDelay
  // so that the animation appears as if it has been running for a while.
  const blocks = [
    // Blue blocks
    { color: "block-blue", left: "10%", width: "4rem", height: "4rem", duration: 5, baseDelay: 0 },
    { color: "block-blue", left: "30%", width: "5rem", height: "5rem", duration: 7, baseDelay: 1 },
    { color: "block-blue", left: "50%", width: "6rem", height: "6rem", duration: 6, baseDelay: 0.5 },
    // Yellow blocks
    { color: "block-yellow", left: "70%", width: "4rem", height: "4rem", duration: 5.5, baseDelay: 0.2 },
    { color: "block-yellow", left: "20%", width: "5rem", height: "5rem", duration: 6.5, baseDelay: 0.8 },
    { color: "block-yellow", left: "80%", width: "6rem", height: "6rem", duration: 7.5, baseDelay: 1.2 },
    // Pink blocks
    { color: "block-pink", left: "40%", width: "4rem", height: "4rem", duration: 5.2, baseDelay: 0.3 },
    { color: "block-pink", left: "60%", width: "5rem", height: "5rem", duration: 6.8, baseDelay: 0.9 },
    { color: "block-pink", left: "90%", width: "6rem", height: "6rem", duration: 7.1, baseDelay: 1.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {blocks.map((block, index) => {
        // Calculate a random offset within the block's duration.
        // This negative offset makes the block appear as if it's already mid-animation.
        const randomOffset = Math.random() * block.duration;
        return (
          <motion.div
            key={index}
            className={`absolute ${block.color} rounded-xl`}
            style={{
              left: block.left,
              width: block.width,
              height: block.height,
            }}
            // Start just above the viewport and animate to just below it.
            initial={{ y: "-10vh", opacity: 0 }}
            animate={{ y: "110vh", opacity: 0.5 }}
            transition={{
              duration: block.duration,
              ease: "linear",
              repeat: Infinity,
              // Subtract the random offset from the base delay so that each block
              // is already partway through its cycle when the component mounts.
              delay: block.baseDelay - randomOffset,
            }}
          />
        );
      })}
    </div>
  );
}