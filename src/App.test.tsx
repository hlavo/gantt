import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('displays a spinner while loading data', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
