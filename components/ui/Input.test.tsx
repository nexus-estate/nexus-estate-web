import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Full Name" id="name" />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles value change', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('applies error styles to input', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-300');
  });
});
