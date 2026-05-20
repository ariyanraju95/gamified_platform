import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import XPBar from '../../components/gamified/XPBar';

const theme = createTheme();
const renderXPBar = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <XPBar {...props} />
    </ThemeProvider>
  );

describe('XPBar component', () => {
  it('renders without crashing with default props', () => {
    renderXPBar({});
    expect(screen.getByText('0 XP')).toBeInTheDocument();
  });

  it('shows Rookie at level 1 (0–199 XP)', () => {
    renderXPBar({ totalXP: 0 });
    expect(screen.getByText(/Lv\.1 Rookie/i)).toBeInTheDocument();
  });

  it('shows Learner at level 2 (200–499 XP)', () => {
    renderXPBar({ totalXP: 200 });
    expect(screen.getByText(/Lv\.2 Learner/i)).toBeInTheDocument();
  });

  it('shows Coder at level 3 (500–999 XP)', () => {
    renderXPBar({ totalXP: 500 });
    expect(screen.getByText(/Lv\.3 Coder/i)).toBeInTheDocument();
  });

  it('shows Developer at level 4 (1000–1799 XP)', () => {
    renderXPBar({ totalXP: 1000 });
    expect(screen.getByText(/Lv\.4 Developer/i)).toBeInTheDocument();
  });

  it('shows Expert at level 5 (1800–2999 XP)', () => {
    renderXPBar({ totalXP: 1800 });
    expect(screen.getByText(/Lv\.5 Expert/i)).toBeInTheDocument();
  });

  it('shows Master at level 6 (3000+ XP)', () => {
    renderXPBar({ totalXP: 3000 });
    expect(screen.getByText(/Lv\.6 Master/i)).toBeInTheDocument();
  });

  it('displays the formatted XP value', () => {
    renderXPBar({ totalXP: 1250 });
    expect(screen.getByText('1,250 XP')).toBeInTheDocument();
  });

  it('renders a LinearProgress bar', () => {
    renderXPBar({ totalXP: 750 });
    expect(document.querySelector('.MuiLinearProgress-root')).toBeTruthy();
  });

  it('shows "XP to next level" label', () => {
    renderXPBar({ totalXP: 100 });
    expect(screen.getByText(/XP to next level/i)).toBeInTheDocument();
  });
});
