import { Component } from "react";

// Error boundaries must be class components — React has no hook
// equivalent for catching render errors in children. Without this,
// any uncaught error anywhere in the tree unmounts the whole app and
// leaves a blank white screen, which is a much worse experience for a
// kid than a friendly "something broke, try again" card.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // No crash-reporting service is wired up yet — this keeps the error
    // visible in the browser console for debugging instead of silently
    // swallowing it.
    console.error("Code Quest crashed:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <div className="error-boundary">
            <span className="error-boundary__icon">🛠️</span>
            <h1 className="error-boundary__title">Oops, something broke!</h1>
            <p className="error-boundary__text">
              Don't worry — your progress is saved. Let's get you back on track.
            </p>
            <button className="error-boundary__button" onClick={this.handleReload}>
              Reload Code Quest
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
