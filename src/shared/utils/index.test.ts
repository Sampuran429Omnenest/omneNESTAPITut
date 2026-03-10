import { 
  formatPrice, 
  formatPercent, 
  formatVolume, 
  getColor, 
  clamp 
} from './index';

describe('Utility Functions', () => {
  
  describe('formatPrice', () => {
    test('formats numbers with Rupee symbol and 2 decimals', () => {
      expect(formatPrice(1234.5)).toBe('₹1,234.50');
      expect(formatPrice(0)).toBe('₹0.00');
    });
  });

  describe('formatPercent', () => {
    test('adds + sign for positive numbers', () => {
      expect(formatPercent(5.2)).toBe('+5.20%');
    });
    test('keeps - sign for negative numbers', () => {
      expect(formatPercent(-3.141)).toBe('-3.14%');
    });
  });

  describe('formatVolume', () => {
    test('formats millions as Cr (Crores)', () => {
      expect(formatVolume(10000000)).toBe('1.00 Cr');
    });
    test('formats lakhs as L', () => {
      expect(formatVolume(100000)).toBe('1.00 L');
    });
    test('returns standard locale string for small numbers', () => {
      expect(formatVolume(5000)).toBe('5,000');
    });
  });

  describe('getColor', () => {
    test('returns green for positive, red for negative', () => {
      expect(getColor(10)).toBe('#00C87C');
      expect(getColor(-5)).toBe('#FF4D4D');
      expect(getColor(0)).toBe('#00C87C'); // Boundary check
    });
  });

  describe('clamp', () => {
    test('keeps value within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });
  });
});