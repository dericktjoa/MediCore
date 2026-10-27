import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the MediCore application', () => {
  render(<App />);
  expect(screen.getByText('MediCore')).toBeInTheDocument();
});
