import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StreakDisplay from '../../components/gamified/StreakDisplay';

const theme = createTheme();
const renderStreak = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <StreakDisplay {...props} />
    </ThemeProvider>
  );

describe('StreakDisplay component', () => {
  it('renders without crashing with default props', () => {
    renderStreak({});
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays the currentStreak number', () => {
    renderStreak({ currentStreak: 5, longestStreak: 7 });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "day streak" label in medium size', () => {
    renderStreak({ currentStreak: 3, longestStreak: 5 });
    expect(screen.getByText(/day streak/i)).toBeInTheDocument();
  });

  it('does not show "day streak" label in small size', () => {
    renderStreak({ currentStreak: 3, longestStreak: 5, size: 'small' });
    expect(screen.queryByText(/day streak/i)).not.toBeInTheDocument();
  });

  it('shows tooltip with longest streak info', () => {
    renderStreak({ currentStreak: 4, longestStreak: 10 });
    // MUI Tooltip clones child and adds aria-label
    expect(screen.getByLabelText(/Longest streak: 10 days/i)).toBeInTheDocument();
  });

  it('renders streak of 0 correctly', () => {
    renderStreak({ currentStreak: 0, longestStreak: 0 });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders a high streak correctly', () => {
    renderStreak({ currentStreak: 30, longestStreak: 30 });
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
