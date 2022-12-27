import { useEffect, useRef, useState } from "react";

export const useIntersection = () => {
  const ref = useRef(null);

  const [isVisible, setIsVisible] = useState<boolean>();

  useEffect(() => {
    const node = ref.current;

    if (node) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];

        setIsVisible(entry?.isIntersecting);
      });

      observer.observe(node);

      return () => observer.disconnect();
    }
  }, []);

  return { ref, isVisible };
};
