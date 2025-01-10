import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-white dark:bg-slate-900 shadow-md z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="container mx-auto py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              <Link to={"/"}>
              Tech News & Tips
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 mr-4">
              <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                About
              </a>
            </nav>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="relative overflow-hidden hover:border-emerald-500 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-transform hover:scale-110" />
              ) : (
                <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400 transition-transform hover:scale-110" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;