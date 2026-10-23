import { render, screen } from '@testing-library/react-native';
import App from './App';

it('renders the shared greeting', async () => {
  await render(<App />);
  expect(screen.getByText('Hello, mobile!')).toBeTruthy();
});
