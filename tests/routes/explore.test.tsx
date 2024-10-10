import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '~/i18n'; // Adjust the import path as necessary
import Explore from '~/routes/explore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useLoaderData hook
vi.mock('@remix-run/react', () => ({
  ...vi.importActual('@remix-run/react'),
  useLoaderData: () => ({
    creators: [
      { id: '1', name: 'Creator 1', bio: 'Bio 1', profileImage: 'image1.jpg' },
      { id: '2', name: 'Creator 2', bio: 'Bio 2', profileImage: 'image2.jpg' },
    ],
  }),
}));

// Mock the i18n instance
vi.mock('~/i18n', () => ({
  t: (key: string) => key,
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Explore component', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Explore />
        </I18nextProvider>
      </BrowserRouter>
    );
  });

  it('renders the explore page title', () => {
    expect(screen.getByText('exploreCreators')).toBeInTheDocument();
  });

  it('renders creator cards', () => {
    expect(screen.getByText('Creator 1')).toBeInTheDocument();
    expect(screen.getByText('Creator 2')).toBeInTheDocument();
  });

  it('renders "View Profile" buttons for each creator', () => {
    const viewProfileButtons = screen.getAllByText('viewProfile');
    expect(viewProfileButtons).toHaveLength(2);
  });
});