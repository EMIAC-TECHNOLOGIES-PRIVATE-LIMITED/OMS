
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import App from './App';
import './index.css';
import ErrorBoundary from './ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
        <RecoilRoot>
            <App />
            
        </RecoilRoot>
    </ErrorBoundary>
);
