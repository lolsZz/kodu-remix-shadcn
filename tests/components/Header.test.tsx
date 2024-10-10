import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '~/i18n'; // Adjust the import path as necessary
import { Header } from '~/components/Header';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the i18n instance
vi.mock('~/i18n', () => ({
  t: (key: string) => key,
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Header component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Header />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  it('renders the logo', () => {
    expect(screen.getByText('OnlyJapan')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    expect(screen.getByText('explore')).toBeInTheDocument();
    expect(screen.getByText('messages')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
  });

  it('renders login and signup buttons', () => {
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('signup')).toBeInTheDocument();
  });
});