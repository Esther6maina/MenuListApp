import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MenuList from '../pages/MenuList';

// Mock axios to avoid real API calls
import axios from 'axios';
jest.mock('axios');

describe('MenuList', () => {
  test('renders MenuList component with date picker and categories', () => {
    // Mock the API response
    axios.get.mockResolvedValue({
      data: { meals: [] },
    });

    // Mock localStorage to simulate a logged-in user
    const token = 'mock-token';
    Storage.prototype.getItem = jest.fn(() => token);

    render(
      <MemoryRouter initialEntries={['/menulist']}>
        <MenuList />
      </MemoryRouter>
    );

    // Check for the heading
    expect(screen.getByText(/Menu List/i)).toBeInTheDocument();

    // Check for the date picker
    expect(screen.getByLabelText(/Select Date/i)).toBeInTheDocument();

    // Check for categories
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Snacks')).toBeInTheDocument();
  });
});