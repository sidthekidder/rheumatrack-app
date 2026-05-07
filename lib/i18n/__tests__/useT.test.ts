import { lookup } from '../useT';

describe('lookup (pure i18n helper)', () => {
  it('returns the English string when language is en', () => {
    expect(lookup('en', 'save')).toBe('Save');
  });

  it('returns the Hindi string when language is hi', () => {
    expect(lookup('hi', 'save')).toBe('सहेजें');
  });

  it('falls back to English when the key is missing in Hindi', () => {
    // splash_tagline is untranslated in hi.ts — value equals the English string
    expect(lookup('hi', 'splash_tagline')).toBe('Your rheumatology companion');
  });

  it('falls back to the key itself when missing in both', () => {
    // @ts-expect-error — intentional: testing fallback for unknown key
    expect(lookup('en', 'nonexistent_key_xyz')).toBe('nonexistent_key_xyz');
  });

  it('interpolates {var} placeholders', () => {
    expect(lookup('en', 'hello_doctor', { name: 'Tanmay' })).toBe('Hello Tanmay,');
  });

  it('leaves {var} literal when no value provided', () => {
    expect(lookup('en', 'hello_doctor', { other: 'X' })).toBe('Hello {name},');
  });
});
