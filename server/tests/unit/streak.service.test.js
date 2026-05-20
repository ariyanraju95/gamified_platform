const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock GamificationState model before importing service
jest.mock('../../models/GamificationState');
const GamificationState = require('../../models/GamificationState');
const { updateStreak } = require('../../services/streak.service');

const mockUserId = 'user123';

const makeMockState = (overrides = {}) => {
  const state = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  return state;
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

describe('streak.service — updateStreak()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns null if no gamification state found', async () => {
    GamificationState.findOne.mockResolvedValue(null);
    const result = await updateStreak(mockUserId);
    expect(result).toBeNull();
  });

  it('starts a streak of 1 on first ever activity', async () => {
    const state = makeMockState({ currentStreak: 0, lastActivityDate: null });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(1);
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('increments streak when last activity was yesterday', async () => {
    const state = makeMockState({
      currentStreak: 3,
      longestStreak: 3,
      lastActivityDate: daysAgo(1),
    });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(4);
    expect(state.longestStreak).toBe(4);
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('resets streak to 1 when last activity was 2+ days ago', async () => {
    const state = makeMockState({
      currentStreak: 7,
      longestStreak: 7,
      lastActivityDate: daysAgo(2),
    });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(7); // preserved
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('does not change streak if already updated today', async () => {
    const state = makeMockState({
      currentStreak: 5,
      longestStreak: 5,
      lastActivityDate: new Date(), // today
    });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(5); // unchanged
    expect(state.save).not.toHaveBeenCalled();
  });

  it('updates longestStreak when currentStreak surpasses it', async () => {
    const state = makeMockState({
      currentStreak: 9,
      longestStreak: 9,
      lastActivityDate: daysAgo(1),
    });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(10);
    expect(state.longestStreak).toBe(10);
  });

  it('does not update longestStreak when currentStreak is already below it after reset', async () => {
    const state = makeMockState({
      currentStreak: 15,
      longestStreak: 15,
      lastActivityDate: daysAgo(3), // missed 2 days — reset
    });
    GamificationState.findOne.mockResolvedValue(state);

    await updateStreak(mockUserId);

    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(15); // kept
  });
});
