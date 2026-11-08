import { createRoot } from 'react-dom/client';
import { App } from '../../ui/App';

createRoot(document.getElementById('root')!).render(<App mode="popup" />);
