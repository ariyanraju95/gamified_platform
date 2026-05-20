const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('../../models/GamificationState');
const GamificationState = require('../../models/GamificationState');
const { awardXP, getStreakMultiplier } = require('../../services/xp.service');

const mockUserId = 'user123';

const makeMockState = (overrides = {}) => ({
  totalXP: 0,
  currentStreak: 0,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('xp.service — getStreakMultiplier()', () => {
  it('returns 1.0 multiplier for streak < 3', () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(1)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it('returns 1.2 multiplier for streak 3–6', () => {
    expect(getStreakMultiplier(3)).toBe(1.2);
    expect(getStreakMultiplier(5)).toBe(1.2);
    expect(getStreakMultiplier(6)).toBe(1.2);
  });

  it('returns 1.5 multiplier for streak >= 7', () => {
    expect(getStreakMultiplier(7)).toBe(1.5);
    expect(getStreakMultiplier(10)).toBe(1.5);
    expect(getStreakMultiplier(30)).toBe(1.5);
  });
});

describe('xp.service — awardXP()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null when state not found', async () => {
    GamificationState.findOne.mockResolvedValue(null);
    const result = await awardXP(mockUserId, 100);
    expect(result).toBeNull();
  });

  it('adds base XP with no streak (multiplier 1.0)', async () => {
    const state = makeMockState({ totalXP: 0, currentStreak: 0 });
    GamificationState.findOne.mockResolvedValue(state);

    const result = await awardXP(mockUserId, 100);

    expect(result.xpEarned).toBe(100);
    expect(result.multiplier).toBe(1.0);
    expect(result.totalXP).toBe(100);
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('applies 1.2x multiplier for 3-day streak', async () => {
    const state = makeMockState({ totalXP: 500, currentStreak: 3 });
    GamificationState.findOne.mockResolvedValue(state);

    const result = await awardXP(mockUserId, 100);

    expect(result.xpEarned).toBe(120);
    expect(result.multiplier).toBe(1.2);
    expect(result.totalXP).toBe(620);
  });

  it('applies 1.5x multiplier for 7-day streak', async () => {
    const state = makeMockState({ totalXP: 1000, currentStreak: 7 });
    GamificationState.findOne.mockResolvedValue(state);

    const result = await awardXP(mockUserId, 200);

    expect(result.xpEarned).toBe(300);
    expect(result.multiplier).toBe(1.5);
    expect(result.totalXP).toBe(1300);
  });

  it('floors XP to nearest integer', async () => {
    const state = makeMockState({ totalXP: 0, currentStreak: 3 });
    GamificationState.findOne.mockResolvedValue(state);

    const result = await awardXP(mockUserId, 75); // 75 * 1.2 = 90.0

    expect(Number.isInteger(result.xpEarned)).toBe(true);
    expect(result.xpEarned).toBe(90);
  });

  it('accumulates XP correctly across multiple awards', async () => {
    const state = makeMockState({ totalXP: 250, currentStreak: 0 });
    GamificationState.findOne.mockResolvedValue(state);

    const result = await awardXP(mockUserId, 50);
    expect(result.totalXP).toBe(300);
  });
});
