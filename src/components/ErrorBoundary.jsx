import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

/** Catches render errors so a crash shows a friendly screen, not a blank page. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this is where you'd report to an error service.
    console.error("Unhandled error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <div className={styles.card}>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Please reload the page and try again.</p>
            <button type="button" onClick={() => window.location.assign("/")}>Back to home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
