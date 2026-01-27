import React, { useEffect, useRef, ReactNode, useCallback } from "react";
import { isIOS as isIOSDevice } from "react-device-detect";
import "./CarouselComponent.scss";

interface CarouselComponentProps {
  children: ReactNode;
  className?: string;
  enableAutoScroll?: boolean;
  isInfinite?: boolean; // whether to enable infinite scrolling or stop at end
  scrollMode?: "smooth" | "card"; // 'smooth' for pixel-by-pixel, 'card' for card-by-card
  scrollInterval?: number; // interval in milliseconds (for card mode or legacy smooth mode)
  pixelsPerSecond?: number; // pixels per second for smooth mode (overrides scrollInterval calculation)
  duplicateCount?: number; // how many times to duplicate content (only used when isInfinite=true)
  dependencies?: any[]; // dependencies for useEffect
}

const CarouselComponent: React.FC<CarouselComponentProps> = ({
  children,
  className = "",
  enableAutoScroll = false,
  isInfinite = true,
  scrollMode = "smooth",
  scrollInterval = 30,
  pixelsPerSecond = 50, // Default smooth scrolling speed
  duplicateCount = 4,
  dependencies = [],
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(false);
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cardTransitionRef = useRef({
    isTransitioning: false,
    targetPosition: 0,
    startPosition: 0,
    progress: 0,
  });
  // Smooth scroll timing refs
  const lastTimestampRef = useRef(0);
  const accumulatedDistanceRef = useRef(0);
  const isRunningRef = useRef(false);

  const isIOS = useRef(isIOSDevice);

  // Smooth reset function to prevent flickering - iOS compatible
  const smoothReset = useCallback((newPosition: number) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    isAutoScrollingRef.current = true;

    // iOS Fix: Use scrollTo for better compatibility
    if (isIOS.current) {
      try {
        scrollContainer.scrollTo({
          left: newPosition,
          behavior: "auto",
        });
      } catch (error) {
        scrollContainer.scrollLeft = newPosition;
      }
    } else {
      scrollContainer.scrollLeft = newPosition;
    }

    // iOS needs slightly longer timeout
    setTimeout(
      () => {
        isAutoScrollingRef.current = false;
      },
      isIOS.current ? 100 : 50
    );
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Reset logic for infinite scroll (only when isInfinite is true)
    const handleScroll = () => {
      if (!isInfinite || isAutoScrollingRef.current) return;

      const totalScrollWidth = scrollContainer.scrollWidth;
      const visibleWidth = scrollContainer.offsetWidth;

      // Calculate the width of one complete set
      const oneSetWidth = totalScrollWidth / duplicateCount;

      // If near the duplicated part's end, reset to equivalent position in first set
      if (
        scrollContainer.scrollLeft + visibleWidth >=
        totalScrollWidth - visibleWidth * 0.1 // Add small buffer to prevent premature reset
      ) {
        const currentPositionInSet = scrollContainer.scrollLeft % oneSetWidth;
        smoothReset(oneSetWidth + currentPositionInSet);
      }

      // Handle backward scrolling past the beginning
      if (scrollContainer.scrollLeft <= oneSetWidth * 0.1) {
        const currentPositionInSet = scrollContainer.scrollLeft % oneSetWidth;
        smoothReset(oneSetWidth + currentPositionInSet);
      }
    };

    // Add scroll event listener for manual scroll reset
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    // Auto-scroll logic - iOS-compatible approach
    const smoothAutoScroll = () => {
      if (
        !enableAutoScroll ||
        !scrollContainer ||
        scrollMode !== "smooth" ||
        !isRunningRef.current
      ) {
        return;
      }

      // Check if we've reached the end (for non-infinite scrolling)
      if (!isInfinite) {
        const totalScrollWidth = scrollContainer.scrollWidth;
        const visibleWidth = scrollContainer.offsetWidth;

        if (scrollContainer.scrollLeft + visibleWidth >= totalScrollWidth - 5) {
          isRunningRef.current = false;
          return;
        }
      }

      // Set flag briefly during scroll to prevent conflicts
      isAutoScrollingRef.current = true;

      // iOS Fix: Use scrollTo instead of direct scrollLeft assignment
      const currentScroll = scrollContainer.scrollLeft;
      const moveDistance = pixelsPerSecond ? pixelsPerSecond / 60 : 1; // 60fps
      const newScrollPosition = currentScroll + moveDistance;

      // iOS Safari works better with scrollTo than direct scrollLeft assignment
      try {
        scrollContainer.scrollTo({
          left: newScrollPosition,
          behavior: "auto", // Important: 'auto' instead of 'smooth' for programmatic control
        });
      } catch (error) {
        // Fallback for older browsers
        scrollContainer.scrollLeft = newScrollPosition;
      }

      // Reset flag - iOS needs slightly longer timing
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 20);

      // Continue smooth scrolling - iOS-optimized timing
      if (isRunningRef.current && scrollMode === "smooth") {
        // iOS Fix: Use only requestAnimationFrame, no setTimeout wrapper
        animationFrameRef.current = requestAnimationFrame(smoothAutoScroll);
      }
    };

    // Card scroll logic (more complex with transitions)
    const cardScrollStep = () => {
      if (!enableAutoScroll || !scrollContainer || scrollMode !== "card") {
        isRunningRef.current = false;
        return;
      }

      isAutoScrollingRef.current = true;

      const firstChild = scrollContainer.children[0] as HTMLElement;
      if (!firstChild) {
        isRunningRef.current = false;
        isAutoScrollingRef.current = false;
        return;
      }

      const cardWidth = firstChild.offsetWidth + 4;
      const transition = cardTransitionRef.current;

      // If not currently transitioning, start a new card transition
      if (!transition.isTransitioning) {
        const currentPosition = scrollContainer.scrollLeft;
        const targetPosition = currentPosition + cardWidth;

        // Check bounds for non-infinite scrolling
        if (!isInfinite) {
          const totalScrollWidth = scrollContainer.scrollWidth;
          const visibleWidth = scrollContainer.offsetWidth;

          if (targetPosition + visibleWidth >= totalScrollWidth) {
            isRunningRef.current = false;
            isAutoScrollingRef.current = false;
            return;
          }
        }

        // Start transition
        transition.isTransitioning = true;
        transition.startPosition = currentPosition;
        transition.targetPosition = targetPosition;
        transition.progress = 0;
      }

      // Continue the transition
      if (transition.isTransitioning) {
        transition.progress += 0.02; // Adjust speed of card transition (0.02 = ~50 frames for full transition)

        if (transition.progress >= 1) {
          // Transition complete
          scrollContainer.scrollLeft = transition.targetPosition;
          transition.isTransitioning = false;
          transition.progress = 0;

          // Reset auto-scrolling flag
          setTimeout(() => {
            isAutoScrollingRef.current = false;
          }, 10);

          // Wait longer before next card (card mode should have longer intervals)
          if (isRunningRef.current) {
            timeoutRef.current = setTimeout(() => {
              animationFrameRef.current = requestAnimationFrame(cardScrollStep);
            }, Math.max(scrollInterval * 50, 2000)); // Minimum 2 seconds between cards
          }
        } else {
          // Smooth interpolation between start and target
          const easedProgress = 1 - Math.pow(1 - transition.progress, 3); // Ease-out cubic
          const newPosition =
            transition.startPosition +
            (transition.targetPosition - transition.startPosition) *
              easedProgress;
          scrollContainer.scrollLeft = newPosition;

          // Continue transition with quick frame rate for smoothness
          if (isRunningRef.current) {
            animationFrameRef.current = requestAnimationFrame(cardScrollStep);
          }
        }
      }
    };

    // Start auto-scroll if enabled
    if (enableAutoScroll) {
      isRunningRef.current = true;
      if (scrollMode === "smooth") {
        // Reset timing variables for smooth scroll
        lastTimestampRef.current = 0;
        accumulatedDistanceRef.current = 0;

        // iOS Fix: Add small delay for proper initialization
        const startDelay = isIOS.current ? 100 : 0;
        timeoutRef.current = setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(smoothAutoScroll);
        }, startDelay);
      } else if (scrollMode === "card") {
        timeoutRef.current = setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(cardScrollStep);
        }, scrollInterval);
      }
    }

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      isRunningRef.current = false;
      // Reset card transition state
      cardTransitionRef.current.isTransitioning = false;
      cardTransitionRef.current.progress = 0;
      // Reset smooth scroll timing variables
      lastTimestampRef.current = 0;
      accumulatedDistanceRef.current = 0;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    ...dependencies,
    enableAutoScroll,
    isInfinite,
    scrollMode,
    scrollInterval,
    pixelsPerSecond,
    duplicateCount,
    smoothReset,
  ]);

  // Create content (duplicated for infinite scroll, single for non-infinite)
  const carouselContent = isInfinite
    ? Array.from({ length: duplicateCount }, (_, index) => (
        <React.Fragment key={`duplicate-${index}`}>{children}</React.Fragment>
      ))
    : children;

  return (
    <div className={`infinite-scroll-carousel ${className}`} ref={scrollRef}>
      {carouselContent}
    </div>
  );
};

export default CarouselComponent;
