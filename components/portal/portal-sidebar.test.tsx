import { render, screen } from '@testing-library/react';
import { PortalSidebar } from './portal-sidebar';

let mockPathname = '/provider';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('./language-switcher', () => ({ LanguageSwitcher: () => null }));
jest.mock('./nexus-brand', () => ({ NexusBrand: () => null }));

test('navigation survives translated text nodes when the active item changes', () => {
  mockPathname = '/provider';
  const props = {
    platform: 'provider',
    items: [
      { label: 'Overview', href: '/provider' },
      { label: 'Properties', href: '/provider/properties' },
    ],
    open: true,
    onClose: jest.fn(),
  };
  const { rerender, unmount } = render(<PortalSidebar {...props} />);

  // Browser translation replaces React-owned text with font elements.
  for (const name of ['Overview', 'Properties']) {
    const link = screen.getByRole('link', { name });
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    const text = walker.nextNode()!;
    const translated = document.createElement('font');
    translated.textContent = text.textContent;
    text.parentNode!.replaceChild(translated, text);
  }

  mockPathname = '/provider/properties';
  expect(() => rerender(<PortalSidebar {...props} />)).not.toThrow();
  expect(screen.getByRole('link', { name: 'Properties' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  mockPathname = '/provider';
  expect(() => rerender(<PortalSidebar {...props} />)).not.toThrow();
  expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(unmount).not.toThrow();
});
