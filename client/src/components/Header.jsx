import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-md dark:bg-slate-900 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="container px-6 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text">
              <Link to={"/"}>
              Tech News & Tips
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="items-center hidden gap-6 mr-4 md:flex">
              <a href="/about" className="text-gray-600 transition-colors dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                About
              </a>
            </nav>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="relative overflow-hidden transition-colors hover:border-emerald-500"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 transition-transform text-emerald-600 dark:text-emerald-400 hover:scale-110" />
              ) : (
                <Sun className="w-5 h-5 transition-transform text-emerald-600 dark:text-emerald-400 hover:scale-110" />
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