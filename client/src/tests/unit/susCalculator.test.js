import { describe, it, expect } from 'vitest';
import { computeSUSScore, getSUSGrade } from '../../utils/susCalculator';

describe('computeSUSScore()', () => {
  // All neutral (3s) should produce 50
  it('returns 50 for all-neutral responses (3 on each item)', () => {
    const scores = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    expect(computeSUSScore(scores)).toBe(50);
  });

  // All 5s on odd items, all 1s on even items => max score 100
  it('returns 100 for perfect positive responses', () => {
    // Odd indices (1,3,5,7,9): score=5 → 5-1=4; Even indices (2,4,6,8,10): score=1 → 5-1=4
    const scores = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
    expect(computeSUSScore(scores)).toBe(100);
  });

  // All 1s on odd items, all 5s on even items => min score 0
  it('returns 0 for all worst responses', () => {
    const scores = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5];
    expect(computeSUSScore(scores)).toBe(0);
  });

  // Known example: scores [4,1,4,1,4,1,4,1,4,1] → odd(4-1=3)*5 + even(5-1=4)*5 = 15+20=35, *2.5=87.5
  it('calculates correctly for a known high-scoring set', () => {
    const scores = [4, 1, 4, 1, 4, 1, 4, 1, 4, 1];
    expect(computeSUSScore(scores)).toBe(87.5);
  });

  // Mixed realistic response
  it('handles mixed realistic responses correctly', () => {
    // scores: [4, 2, 4, 3, 3, 2, 4, 2, 4, 2]
    // odd: (4-1)+(4-1)+(3-1)+(4-1)+(4-1) = 3+3+2+3+3 = 14
    // even: (5-2)+(5-3)+(5-2)+(5-2)+(5-2) = 3+2+3+3+3 = 14
    // total = 28 * 2.5 = 70
    const scores = [4, 2, 4, 3, 3, 2, 4, 2, 4, 2];
    expect(computeSUSScore(scores)).toBe(70);
  });
});

describe('getSUSGrade()', () => {
  it('returns Excellent for score >= 85', () => {
    expect(getSUSGrade(85).label).toBe('Excellent');
    expect(getSUSGrade(100).label).toBe('Excellent');
    expect(getSUSGrade(90).label).toBe('Excellent');
  });

  it('returns Good for score 70–84', () => {
    expect(getSUSGrade(70).label).toBe('Good');
    expect(getSUSGrade(75).label).toBe('Good');
    expect(getSUSGrade(84).label).toBe('Good');
  });

  it('returns OK for score 50–69', () => {
    expect(getSUSGrade(50).label).toBe('OK');
    expect(getSUSGrade(60).label).toBe('OK');
    expect(getSUSGrade(69).label).toBe('OK');
  });

  it('returns Poor for score < 50', () => {
    expect(getSUSGrade(0).label).toBe('Poor');
    expect(getSUSGrade(30).label).toBe('Poor');
    expect(getSUSGrade(49).label).toBe('Poor');
  });

  it('returns correct colors for each grade', () => {
    expect(getSUSGrade(90).color).toBe('#16a34a');
    expect(getSUSGrade(75).color).toBe('#2563eb');
    expect(getSUSGrade(55).color).toBe('#d97706');
    expect(getSUSGrade(20).color).toBe('#dc2626');
  });
});
