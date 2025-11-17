import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, List, Gift, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationProps {
    className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
    const isMobile = useIsMobile();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: "/" },
        { id: "tasks", label: "Tasks", icon: List, path: "/tasks" },
        { id: "rewards", label: "Rewards", icon: Gift, path: "/rewards" },
        { id: "profile", label: "Profile", icon: User, path: "/profile" },
        { id: "admin", label: "Admin", icon: Settings, path: "/admin" },
    ];

    if (isMobile) {
        return (
            <nav
                className={cn(
                    "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50",
                    className
                )}
            >
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? "secondary" : "ghost"}
                                size="icon"
                                className={cn(
                                    "rounded-full transition-all",
                                    isActive && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => navigate(item.path)}
                            >
                                <Icon size={20} />
                                <span className="sr-only">{item.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </nav>
        );
    }

    return (
        <nav className={cn("bg-background border-b border-border", className)}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "flex items-center space-x-2 transition-all",
                                        isActive && "bg-primary text-primary-foreground"
                                    )}
                                    onClick={() => navigate(item.path)}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
