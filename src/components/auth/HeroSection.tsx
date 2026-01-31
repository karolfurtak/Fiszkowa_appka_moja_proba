import * as React from 'react';
import { Sparkles, Brain, TrendingUp } from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Generowanie AI',
    description: 'Wklej tekst, a AI stworzy fiszki automatycznie',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'Spaced Repetition',
    description: 'Naukowy algorytm maksymalizuje zapamiętywanie',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Śledzenie postępów',
    description: 'Monitoruj swoje postępy i utrzymuj streak',
  },
];

interface FloatingShape {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'flashcard';
  opacity: number;
  depth: number; // 1-3 for parallax layers
}

function generateFloatingShapes(): FloatingShape[] {
  const shapes: ('circle' | 'square' | 'flashcard')[] = ['circle', 'square', 'flashcard'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: 25 + Math.random() * 45,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 8 + Math.random() * 6,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    opacity: 0.03 + Math.random() * 0.05,
    depth: (i % 3) + 1, // Creates 3 depth layers
  }));
}

export function HeroSection() {
  const [shapes] = React.useState<FloatingShape[]>(generateFloatingShapes);
  const [mousePosition, setMousePosition] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  return (
    <div
      className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent animate-gradient-shift"
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Parallax gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 transition-transform duration-300 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
        }}
      />

      {/* Floating shapes with depth layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {shapes.map((shape) => {
          const parallaxMultiplier = shape.depth * 0.015;
          return (
            <div
              key={shape.id}
              className={shape.id % 2 === 0 ? 'animate-float' : 'animate-float-reverse'}
              style={{
                position: 'absolute',
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: shape.shape === 'flashcard' ? `${shape.size * 0.65}px` : `${shape.size}px`,
                opacity: shape.opacity * (0.7 + shape.depth * 0.15),
                animationDelay: `${shape.delay}s`,
                animationDuration: `${shape.duration}s`,
                transform: `translate(${(mousePosition.x - 50) * parallaxMultiplier * (shape.id % 3 + 1)}px, ${(mousePosition.y - 50) * parallaxMultiplier * (shape.id % 3 + 1)}px)`,
                transition: 'transform 0.3s ease-out',
                zIndex: shape.depth,
              }}
            >
              {shape.shape === 'circle' && (
                <div className="w-full h-full rounded-full bg-white/80" />
              )}
              {shape.shape === 'square' && (
                <div className="w-full h-full rounded-lg bg-white/80 rotate-12" />
              )}
              {shape.shape === 'flashcard' && (
                <div className="w-full h-full rounded-md bg-white/80 rotate-6 relative overflow-hidden">
                  <div className="absolute top-1/4 left-2 right-2 h-[2px] bg-white/30 rounded" />
                  <div className="absolute top-1/2 left-2 right-4 h-[2px] bg-white/30 rounded" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6 max-w-md relative z-10 text-primary-foreground">
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
            <svg
              className="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="6"
                width="14"
                height="10"
                rx="2"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <rect
                x="5"
                y="4"
                width="14"
                height="10"
                rx="2"
                fill="currentColor"
                fillOpacity="0.5"
              />
              <rect
                x="7"
                y="2"
                width="14"
                height="10"
                rx="2"
                fill="currentColor"
              />
              <path
                d="M11 5.5h4M11 7.5h6"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fiszki-MyAPP</h1>
            <p className="text-sm text-primary-foreground/70">Twój asystent nauki</p>
          </div>
        </div>

        <p className="text-xl text-primary-foreground/90">
          Ucz się szybciej i skuteczniej z inteligentnymi fiszkami generowanymi przez AI.
        </p>

        {/* Features with staggered animation and enhanced hover */}
        <div className="space-y-4 pt-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group/card flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:translate-x-2 hover:shadow-lg hover:shadow-white/5 animate-slide-up-fade cursor-default"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="p-2 bg-white/20 rounded-lg shrink-0 transition-transform duration-300 group-hover/card:scale-110">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-primary-foreground/80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
