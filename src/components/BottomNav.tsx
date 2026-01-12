'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarHeart, Camera, Image, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: CalendarHeart,
      label: 'Dates',
    },
    {
      href: '/memories',
      icon: Camera,
      label: 'Memories',
    },
    {
      href: '/collage',
      icon: Image,
      label: 'Collage',
    },
  ];

  return (
    <nav 
      className="bg-white border-t border-gray-100 pb-safe"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around py-2 relative">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            // Insert FAB in the middle
            if (index === 1) {
              return (
                <div key="nav-group" className="contents">
                  <Link href={item.href} key={item.href}>
                    <div className="flex flex-col items-center py-2 px-4">
                      <Icon
                        className={cn(
                          'w-6 h-6 transition-colors',
                          isActive ? 'text-rose-500' : 'text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs mt-1 transition-colors',
                          isActive ? 'text-rose-500 font-medium' : 'text-gray-400'
                        )}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-0.5 w-12 h-0.5 bg-rose-500 rounded-full"
                        />
                      )}
                    </div>
                  </Link>
                  
                  {/* FAB Button */}
                  <button
                    key="fab"
                    onClick={onAddClick}
                    className="relative -mt-8"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 active:scale-95 transition-transform">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                  </button>
                </div>
              );
            }
            
            return (
              <Link href={item.href} key={item.href}>
                <div className="flex flex-col items-center py-2 px-4 relative">
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isActive ? 'text-rose-500' : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs mt-1 transition-colors',
                      isActive ? 'text-rose-500 font-medium' : 'text-gray-400'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
