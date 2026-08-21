// Site entry point.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyFlavour, readFlavour } from './flavours';

// The library's own stylesheet, exactly as a consumer would import it.
import '@lib/styles/theme.css';
import './styles/site.css';

// Stamp the remembered flavour before the first paint, so a returning
// visitor never sees Bondi flash past on the way to the one they picked.
applyFlavour(readFlavour());

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>
);
