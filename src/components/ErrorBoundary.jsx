import React from 'react';
import PropTypes from 'prop-types'; // Ensure this import is correct

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
          <h2 className="text-lg font-bold text-red-800">Something went wrong</h2>
          <pre className="text-red-600 text-sm mt-2 mb-4 overflow-auto">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.resetError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  onReset: PropTypes.func
};

export default ErrorBoundary;