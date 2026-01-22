import { Transition } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};
