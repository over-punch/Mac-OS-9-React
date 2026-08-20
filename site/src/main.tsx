// Site entry point.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// The library's own stylesheet, exactly as a consumer would import it.
import '@lib/styles/theme.css';
import './styles/site.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>
);
