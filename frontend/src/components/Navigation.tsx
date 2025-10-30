import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="font-bold text-xl text-primary">MedNarrate</a>
        
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex gap-6">
            <NavigationMenuItem>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
            </NavigationMenuItem>
            {isAuthenticated && (
              <>
                <NavigationMenuItem>
                  <Button variant="ghost" onClick={() => navigate('/history')}>
                    History
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button 
                    variant="outline" 
                    onClick={logout}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  >
                    Logout
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                </NavigationMenuItem>
              </>
            )}
            {!isAuthenticated && (
              <NavigationMenuItem>
                <Button 
                  variant="default"
                  onClick={() => navigate('/login')}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Login
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}