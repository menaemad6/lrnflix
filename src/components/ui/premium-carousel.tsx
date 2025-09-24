import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

export interface PremiumCarouselProps {
  children: React.ReactNode[]
  className?: string
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  pauseOnHover?: boolean
  itemsPerView?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  spacing?: number
  overlayPosition?: "left" | "right"
  overlayColor?: "primary" | "secondary" | "accent"
  overlayOpacity?: number
  showPlayPause?: boolean
  onSlideChange?: (index: number) => void
}

export const PremiumCarousel = React.forwardRef<
  HTMLDivElement,
  PremiumCarouselProps
>(({
  children,
  className,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  pauseOnHover = true,
  itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  spacing = 24,
  overlayPosition = "right",
  overlayColor = "primary",
  overlayOpacity = 0.1,
  showPlayPause = false,
  onSlideChange,
  ...props
}, ref) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(autoPlay)
  const [isHovered, setIsHovered] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout>()

  // Update current slide
  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap()
      setCurrent(newIndex)
      onSlideChange?.(newIndex)
    })
  }, [api, onSlideChange])

  // Auto play functionality
  React.useEffect(() => {
    if (!autoPlay || !api || !isPlaying || isHovered) return

    intervalRef.current = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [api, autoPlay, isPlaying, isHovered, autoPlayInterval])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  const scrollPrev = () => {
    api?.scrollPrev()
  }

  const scrollNext = () => {
    api?.scrollNext()
  }

  const overlayColorClass = {
    primary: "from-primary/20 via-primary/10 to-transparent",
    secondary: "from-secondary/20 via-secondary/10 to-transparent",
    accent: "from-accent/20 via-accent/10 to-transparent"
  }[overlayColor]

  const overlayPositionClass = overlayPosition === "right" 
    ? "right-0" 
    : "left-0"

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      {...props}
    >
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent 
            className={cn(
              "-ml-4",
              `gap-${spacing / 4}`
            )}
            style={{
              '--spacing': `${spacing}px`
            } as React.CSSProperties}
          >
            {children.map((child, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "pl-4",
                  // Mobile: always full width
                  "basis-full",
                  // Tablet responsive classes
                  itemsPerView.tablet === 1 && "sm:basis-full",
                  itemsPerView.tablet === 2 && "sm:basis-1/2",
                  itemsPerView.tablet === 3 && "sm:basis-1/3",
                  itemsPerView.tablet === 4 && "sm:basis-1/4",
                  itemsPerView.tablet === 5 && "sm:basis-1/5",
                  itemsPerView.tablet === 6 && "sm:basis-1/6",
                  // Desktop responsive classes
                  itemsPerView.desktop === 1 && "lg:basis-full",
                  itemsPerView.desktop === 2 && "lg:basis-1/2",
                  itemsPerView.desktop === 3 && "lg:basis-1/3",
                  itemsPerView.desktop === 4 && "lg:basis-1/4",
                  itemsPerView.desktop === 5 && "lg:basis-1/5",
                  itemsPerView.desktop === 6 && "lg:basis-1/6"
                )}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="h-full"
                >
                  {child}
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Premium Overlay */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-32 pointer-events-none",
            overlayPositionClass,
            "bg-gradient-to-l",
            overlayColorClass
          )}
          style={{
            background: overlayPosition === "right" 
              ? `linear-gradient(to left, hsl(var(--${overlayColor}) / ${overlayOpacity}), transparent)`
              : `linear-gradient(to right, hsl(var(--${overlayColor}) / ${overlayOpacity}), transparent)`
          }}
        />

        {/* Navigation Arrows */}
        {showArrows && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "h-12 w-12 rounded-full",
                "bg-background/80 backdrop-blur-sm border-white/20",
                "hover:bg-background/90 hover:scale-110",
                "transition-all duration-300",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              onClick={scrollPrev}
              disabled={!api?.canScrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "h-12 w-12 rounded-full",
                "bg-background/80 backdrop-blur-sm border-white/20",
                "hover:bg-background/90 hover:scale-110",
                "transition-all duration-300",
                "shadow-lg hover:shadow-xl",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              onClick={scrollNext}
              disabled={!api?.canScrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Play/Pause Button */}
        {showPlayPause && autoPlay && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute top-4 right-4 z-10",
              "h-10 w-10 rounded-full",
              "bg-background/80 backdrop-blur-sm border-white/20",
              "hover:bg-background/90 hover:scale-110",
              "transition-all duration-300",
              "shadow-lg hover:shadow-xl"
            )}
            onClick={togglePlayPause}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Pause className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Play className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}
      </div>

      {/* Dots Navigation */}
      {showDots && count > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                "hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                current === index
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {count > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">
            {current + 1} / {count}
          </span>
        </div>
      )}
    </div>
  )
})

PremiumCarousel.displayName = "PremiumCarousel"

// Additional utility components for enhanced carousel usage

export interface PremiumCarouselCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "glass" | "elevated"
  hoverEffect?: boolean
}

export const PremiumCarouselCard = React.forwardRef<
  HTMLDivElement,
  PremiumCarouselCardProps
>(({
  children,
  className,
  variant = "glass",
  hoverEffect = true,
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-card border border-border shadow-sm",
    glass: "glass-card border-0 shadow-2xl",
    elevated: "bg-card border border-border shadow-dynamic-card-elevated"
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-2xl overflow-hidden h-full",
        variantClasses[variant],
        hoverEffect && "hover-glow cursor-pointer",
        className
      )}
      whileHover={hoverEffect ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

PremiumCarouselCard.displayName = "PremiumCarouselCard"

export interface PremiumCarouselSlideProps {
  children: React.ReactNode
  className?: string
  index?: number
  isActive?: boolean
}

export const PremiumCarouselSlide = React.forwardRef<
  HTMLDivElement,
  PremiumCarouselSlideProps
>(({
  children,
  className,
  index = 0,
  isActive = false,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative h-full",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive ? 1 : 0.95
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

PremiumCarouselSlide.displayName = "PremiumCarouselSlide"