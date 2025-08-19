// import { motion, AnimatePresence, PanInfo } from "framer-motion";
// import { cn } from "@/lib/utils";

// interface DraggableModalProps {
//   isOpen: boolean;
//   onClose?: () => void;
//   children: React.ReactNode;
//   className?: string;
// }

// export function DraggableModal({
//   isOpen,
//   onClose,
//   children,
//   className
// }: DraggableModalProps) {

//   const handleDragEnd = (_: never, info: PanInfo) => {
//     if (Math.abs(info.offset.y) > 100) {
//       onClose?.();
//     }
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-40 bg-black/50"
//           />

//           {/* Modal draggable */}
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", damping: 20 }}
//             drag="y"
//             dragConstraints={{ top: 0, bottom: 0 }}
//             dragElastic={0.2}
//             onDragEnd={handleDragEnd}
//             className={cn(
//               "fixed bottom-0 left-0 right-0 z-50",
//               "w-full max-w-md mx-auto",
//               "bg-white dark:bg-gray-900",
//               "rounded-t-2xl shadow-xl",
//               className
//             )}
//           >
//             {/* Indicateur de drag */}
//             <div className="w-12 h-1 mx-auto my-2 bg-gray-300 dark:bg-gray-600 rounded-full" />

//             {children}
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }