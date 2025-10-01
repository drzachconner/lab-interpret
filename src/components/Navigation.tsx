import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  variant?: 'default' | 'simple';
  showBackButton?: boolean;
  backButtonText?: string;
  className?: string;
}

export function Navigation({ 
  variant = 'default', 
  showBackButton = false, 
  backButtonText = 'Back to Home',
  className = ''
}: NavigationProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const navigationItems = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Sample Reports', path: '/sample-reports' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'FAQ', path: '/faq' }
  ];

  return (
    <nav className={`border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center">
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <Brain className="h-4 w-4" />
              {backButtonText}
            </Button>
          )}
        </div>

        {/* Center - Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BiohackLabs.ai
          </span>
        </div>

        {/* Desktop Navigation */}
        {variant === 'default' && (
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                onClick={() => navigate(item.path)} 
                className="text-gray-700 hover:text-blue-600"
              >
                {item.label}
              </Button>
            ))}
            
            {user ? (
              // Logged in user buttons
              <>
                <div className="text-sm text-gray-600 mr-4">
                  {user.email}
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard')} 
                  className="text-gray-700 hover:text-blue-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              // Non-logged in user buttons
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth?tab=signin')}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth?type=analysis')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        )}

        {/* Simple variant - just auth buttons */}
        {variant === 'simple' && (
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')} 
                className="text-gray-700 hover:text-blue-600"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 hover:text-blue-600"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-3">
            {variant === 'default' && navigationItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} 
                className="w-full justify-start text-gray-700 hover:text-blue-600"
              >
                {item.label}
              </Button>
            ))}
            
            {user ? (
              // Logged in user mobile menu
              <>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-3">
                    {user.email}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} 
                    className="w-full justify-start text-gray-700 hover:text-blue-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="w-full justify-start text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              // Non-logged in user mobile menu
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => { navigate('/auth?tab=signin'); setMobileMenuOpen(false); }}
                  className="w-full border-blue-200 hover:bg-blue-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => { navigate('/auth?type=analysis'); setMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}