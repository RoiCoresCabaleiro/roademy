import { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";

export default function ScrollToTopButton({ threshold = 300, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainElement = document.querySelector("main");

    if (!mainElement) return;

    const toggleVisibility = () => {
      const currentScrollTop = mainElement.scrollTop;
      setIsVisible(currentScrollTop > threshold);
    };

    toggleVisibility();

    mainElement.addEventListener("scroll", toggleVisibility);
    return () => mainElement.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    const mainElement = document.querySelector("main");

    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      variant="primary"
      size="sm"
      className={`
        fixed right-4 md:right-8 z-50 
        bottom-20 md:bottom-6
        w-12 h-12 rounded-full p-0 
        shadow-medium hover:shadow-lg
        transition-all duration-300
        ${className}
      `}
      title="Volver arriba"
    >
      <ChevronUpIcon className="w-5 h-5" />
    </Button>
  );
}
