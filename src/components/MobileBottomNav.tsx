"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoHomeFill, GoHome } from "react-icons/go";
import { IoSearchOutline, IoSearch } from "react-icons/io5";
import { BiBell, BiBellSolid } from "react-icons/bi";
import { BiEnvelope, BiEnvelopeSolid } from "react-icons/bi";
import { useState, useEffect } from "react";
import { getUnreadNotificationCount } from "../../services/notification";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  const navItems = [
    { href: "/home", label: "Home", icon: GoHome, activeIcon: GoHomeFill },
    { href: "/home/explore", label: "Explore", icon: IoSearchOutline, activeIcon: IoSearch },
    { href: "/home/notifications", label: "Notifications", icon: BiBell, activeIcon: BiBellSolid, badge: unreadCount },
    { href: "/home/messages", label: "Messages", icon: BiEnvelope, activeIcon: BiEnvelopeSolid },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <div className="relative">
                <Icon size={24} className={isActive ? "text-white" : "text-secondary-text"} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "text-white" : "text-secondary-text"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
