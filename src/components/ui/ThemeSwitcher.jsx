import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeSwitcher.css';

export function ThemeSwitcher({ size = 'md', showLabels = false }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`theme-switcher ${size}`} role="radiogroup" aria-label="Color theme selection">
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Light theme"
      >
        <Sun size={size === 'sm' ? 14 : 16} />
        {showLabels && <span>Light</span>}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark theme"
      >
        <Moon size={size === 'sm' ? 14 : 16} />
        {showLabels && <span>Dark</span>}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        className={`theme-option ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title="System theme"
      >
        <Laptop size={size === 'sm' ? 14 : 16} />
        {showLabels && <span>System</span>}
      </button>
    </div>
  );
}
