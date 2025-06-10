import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/day-details/:userId" 
          element={
            <ErrorBoundary 
              onReset={() => window.location.reload()} // Optional reset behavior
            >
              <DayDetails />
            </ErrorBoundary>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}