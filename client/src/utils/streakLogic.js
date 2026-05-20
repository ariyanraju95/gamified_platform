// Frontend streak utilities — mirrors backend streak.service.js logic for display purposes

/**
 * Returns the status of a streak based on lastActivityDate.
 * 'active_today'  — user already completed something today (streak safe)
 * 'can_extend'    — last activity was yesterday; completing today extends it
 * 'broken'        — last activity was 2+ days ago; streak will reset on next completion
 * 'none'          — no activity recorded yet
 */
export const getStreakStatus = (lastActivityDate) => {
  if (!lastActivityDate) return 'none';

  const now = new Date();
  const last = new Date(lastActivityDate);

  // Compare date-only (UTC) to match backend logic
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const lastUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  const diffDays = Math.round((todayUTC - lastUTC) / 86400000);

  if (diffDays === 0) return 'active_today';
  if (diffDays === 1) return 'can_extend';
  return 'broken';
};

/**
 * Returns true if the user has not yet completed anything today
 * and their streak is still alive (i.e. at risk of breaking tomorrow).
 */
export const isStreakAtRisk = (lastActivityDate, currentStreak) => {
  if (!currentStreak || currentStreak === 0) return false;
  return getStreakStatus(lastActivityDate) === 'can_extend';
};

/**
 * Returns the XP multiplier for a given streak length.
 * Mirrors xp.service.js multiplier tiers.
 */
export const getStreakMultiplier = (currentStreak) => {
  if (currentStreak >= 7) return 1.5;
  if (currentStreak >= 3) return 1.2;
  return 1.0;
};

/**
 * Returns a human-readable label for the streak status.
 */
export const getStreakStatusLabel = (lastActivityDate, currentStreak) => {
  const status = getStreakStatus(lastActivityDate);
  if (status === 'active_today') return `${currentStreak}-day streak — active today ✓`;
  if (status === 'can_extend') return `${currentStreak}-day streak — complete a lesson today to keep it!`;
  if (status === 'broken') return 'Streak reset — start a new one today!';
  return 'No streak yet — complete your first lesson!';
};
