import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const Root = () => {
    return (
        <StrictMode>
            <App />
        </StrictMode>
    );
};

createRoot(document.getElementById('root')!).render(<Root />);