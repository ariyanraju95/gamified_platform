import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BadgeGrid from '../../components/gamified/BadgeGrid';

const theme = createTheme();
const renderBadgeGrid = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <BadgeGrid {...props} />
    </ThemeProvider>
  );

const makeBadge = (id, name, iconKey = 'star', description = 'Test badge') => ({
  _id: id,
  name,
  iconKey,
  description,
});

const makeEarned = (badgeId, daysAgo = 1) => ({
  badgeId: { _id: badgeId },
  earnedAt: new Date(Date.now() - daysAgo * 86400000),
});

describe('BadgeGrid component', () => {
  it('renders without crashing with no badges', () => {
    const { container } = renderBadgeGrid({ allBadges: [], earnedBadges: [] });
    expect(container).toBeInTheDocument();
  });

  it('renders all badge names', () => {
    const badges = [
      makeBadge('b1', 'First Step'),
      makeBadge('b2', 'Quick Learner'),
      makeBadge('b3', 'Week Warrior', 'whatshot'),
    ];
    renderBadgeGrid({ allBadges: badges, earnedBadges: [] });

    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Quick Learner')).toBeInTheDocument();
    expect(screen.getByText('Week Warrior')).toBeInTheDocument();
  });

  it('renders correct number of badge items', () => {
    const badges = [
      makeBadge('b1', 'Badge A'),
      makeBadge('b2', 'Badge B'),
      makeBadge('b3', 'Badge C'),
    ];
    renderBadgeGrid({ allBadges: badges, earnedBadges: [] });
    // All 3 badge names should appear
    expect(screen.getAllByText(/Badge [ABC]/)).toHaveLength(3);
  });

  it('marks earned badges differently from locked ones', () => {
    const badges = [makeBadge('b1', 'First Step'), makeBadge('b2', 'Locked Badge')];
    const earned = [makeEarned('b1')];
    renderBadgeGrid({ allBadges: badges, earnedBadges: earned });

    // LockIcon should be present for unearned badge
    const lockIcons = document.querySelectorAll('[data-testid="LockIcon"]');
    expect(lockIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders 7 badges matching the seeded badge set', () => {
    const badges = [
      makeBadge('1', 'First Step', 'star'),
      makeBadge('2', 'Quick Learner', 'school'),
      makeBadge('3', 'Dedicated', 'school'),
      makeBadge('4', 'Week Warrior', 'local_fire_department'),
      makeBadge('5', 'XP Novice', 'emoji_events'),
      makeBadge('6', 'XP Scholar', 'military_tech'),
      makeBadge('7', 'Graduate', 'workspace_premium'),
    ];
    renderBadgeGrid({ allBadges: badges, earnedBadges: [] });
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Graduate')).toBeInTheDocument();
  });

  it('renders with default empty props without crashing', () => {
    renderBadgeGrid({});
    // Should render empty grid with no errors
    expect(document.querySelector('.MuiGrid-container')).toBeInTheDocument();
  });
});
