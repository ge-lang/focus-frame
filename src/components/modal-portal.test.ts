import { describe, expect, it } from 'vitest';
import { getThemeScopeClass } from './modal-portal';

describe('modal theme scope', () => {
  it('maps the active theme to the corresponding workspace scope', () => {
    expect(getThemeScopeClass('dark')).toBe('ff-dark-workspace');
    expect(getThemeScopeClass('light')).toBe('ff-light-workspace');
  });
});
