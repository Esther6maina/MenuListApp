// test/script.test.js
const { handleAddItem, createListItem, getListData } = require('../public/script.js');

// Mock validate object
jest.mock('../public/script.js', () => {
  const originalModule = jest.requireActual('../public/script.js');
  return {
    ...originalModule,
    validate: {
      isNonEmpty: jest.fn(() => true),
    },
  };
});

// Mock logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

// Mock prompt and alert
beforeEach(() => {
  // Mock window.prompt to return a default value or null
  window.prompt = jest.fn().mockReturnValue(null); // Simulates user canceling or no input
  // Mock window.alert to capture calls
  window.alert = jest.fn();
  // Mock debouncedSave
  window.debouncedSave = jest.fn();
  // Set up DOM
  document.body.innerHTML = `
    <div class="meal-section" data-meal="breakfast">
      <button class="add-meal">+</button>
      <input class="meal-input" type="text">
      <ul class="meal-list"></ul>
    </div>
    <div class="activity-section">
      <button class="add-activity">+</button>
      <input class="meal-input" type="text">
      <ul class="meal-list"></ul>
    </div>
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks(); // Clear mocks after each test
});

describe('script.js Functions', () => {
  let section, addBtn, input, list;

  beforeEach(() => {
    section = document.querySelector('.meal-section');
    addBtn = section.querySelector('.add-meal');
    input = section.querySelector('.meal-input');
    list = section.querySelector('.meal-list');
  });

  test('handleAddItem adds a valid item', () => {
    input.value = 'Apple';
    handleAddItem(input, list, section);
    expect(list.children.length).toBe(1);
    expect(list.firstChild.textContent).toContain('Apple');
    expect(list.firstChild.querySelector('.delete-btn')).toBeTruthy();
    expect(window.prompt).toHaveBeenCalledTimes(1); // Expect prompt for calories
    expect(window.debouncedSave).toHaveBeenCalledTimes(1); // Verify debouncedSave was called
  });

  test('handleAddItem rejects empty input with validation', () => {
    input.value = '';
    handleAddItem(input, list, section);
    expect(window.alert).toHaveBeenCalledWith('Item text cannot be empty.');
    expect(list.children.length).toBe(0);
    expect(window.debouncedSave).not.toHaveBeenCalled(); // Should not call debouncedSave on error
  });

  test('createListItem creates a list item with correct structure', () => {
    const li = createListItem('Banana', '2025-03-14 10:00 AM', 100, 0, document);
    expect(li.tagName).toBe('LI');
    expect(li.textContent).toContain('Banana');
    expect(li.dataset.timestamp).toBe('2025-03-14 10:00 AM');
    expect(li.dataset.calories).toBe('100');
    expect(li.querySelector('.delete-btn')).toBeTruthy();
  });

  test('getListData retrieves list items correctly', () => {
    const li = createListItem('Orange', '2025-03-14 11:00 AM', 50, 0, document);
    list.appendChild(li);
    const data = getListData(list, document);
    expect(data.length).toBe(1);
    expect(data[0].text).toBe('Orange');
    expect(data[0].timestamp).toBe('2025-03-14 11:00 AM'); // Fixed timestamp check
    expect(data[0].calories).toBe(50);
  });
});