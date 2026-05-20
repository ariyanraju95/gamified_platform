const { describe, it, expect, beforeEach } = require('@jest/globals');

jest.mock('../../models/GamificationState');
jest.mock('../../models/Badge');
jest.mock('../../models/Progress');

const GamificationState = require('../../models/GamificationState');
const Badge = require('../../models/Badge');
const Progress = require('../../models/Progress');
const { checkAndAwardBadges } = require('../../services/badge.service');

const userId = 'user123';

const makeId = (n) => `badge_id_${n}`;

const makeBadge = (id, type, value) => ({
  _id: makeId(id),
  name: `Badge ${id}`,
  description: `Test badge ${id}`,
  iconKey: 'star',
  criteria: { type, value },
});

const makeState = (xp, streak, earnedBadges = []) => ({
  totalXP: xp,
  currentStreak: streak,
  badgesEarned: earnedBadges,
  save: jest.fn().mockResolvedValue(true),
});

describe('badge.service — checkAndAwardBadges()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns [] when gamification state not found', async () => {
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const result = await checkAndAwardBadges(userId);
    expect(result).toEqual([]);
  });

  it('awards first_lesson badge when 1 lesson completed', async () => {
    const badge = makeBadge('first', 'first_lesson', 1);
    const state = makeState(50, 1, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(1);

    const awarded = await checkAndAwardBadges(userId);

    expect(awarded).toHaveLength(1);
    expect(awarded[0].name).toBe('Badge first');
    expect(state.badgesEarned).toHaveLength(1);
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('awards xp_threshold badge when XP meets criteria', async () => {
    const badge = makeBadge('xp500', 'xp_threshold', 500);
    const state = makeState(600, 1, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(1);

    const awarded = await checkAndAwardBadges(userId);

    expect(awarded).toHaveLength(1);
    expect(awarded[0].name).toBe('Badge xp500');
  });

  it('does not award xp_threshold badge when XP is below criteria', async () => {
    const badge = makeBadge('xp500', 'xp_threshold', 500);
    const state = makeState(400, 1, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(1);

    const awarded = await checkAndAwardBadges(userId);
    expect(awarded).toHaveLength(0);
    expect(state.save).not.toHaveBeenCalled();
  });

  it('awards streak_days badge when streak meets criteria', async () => {
    const badge = makeBadge('streak7', 'streak_days', 7);
    const state = makeState(100, 7, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(2);

    const awarded = await checkAndAwardBadges(userId);
    expect(awarded).toHaveLength(1);
    expect(awarded[0].name).toBe('Badge streak7');
  });

  it('does not re-award already earned badges', async () => {
    const badge = makeBadge('xp500', 'xp_threshold', 500);
    const state = makeState(600, 1, [
      { badgeId: { _id: makeId('xp500') }, earnedAt: new Date() },
    ]);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(1);

    const awarded = await checkAndAwardBadges(userId);
    expect(awarded).toHaveLength(0);
    expect(state.save).not.toHaveBeenCalled();
  });

  it('awards multiple badges at once when multiple criteria met', async () => {
    const badges = [
      makeBadge('first', 'first_lesson', 1),
      makeBadge('lessons5', 'lessons_completed', 5),
      makeBadge('xp500', 'xp_threshold', 500),
    ];
    const state = makeState(600, 1, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue(badges);
    Progress.countDocuments.mockResolvedValue(5);

    const awarded = await checkAndAwardBadges(userId);
    expect(awarded).toHaveLength(3);
    expect(state.badgesEarned).toHaveLength(3);
    expect(state.save).toHaveBeenCalledTimes(1);
  });

  it('awards lessons_completed badge at correct threshold', async () => {
    const badge = makeBadge('lessons5', 'lessons_completed', 5);
    const state = makeState(300, 2, []);
    GamificationState.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(state) });
    Badge.find.mockResolvedValue([badge]);
    Progress.countDocuments.mockResolvedValue(4); // one short

    const awarded = await checkAndAwardBadges(userId);
    expect(awarded).toHaveLength(0);

    // Now exactly 5
    Progress.countDocuments.mockResolvedValue(5);
    state.badgesEarned = [];
    const awarded2 = await checkAndAwardBadges(userId);
    expect(awarded2).toHaveLength(1);
  });
});
