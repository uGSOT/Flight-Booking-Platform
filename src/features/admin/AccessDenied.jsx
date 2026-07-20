import { useNavigate } from "react-router-dom";
import styles from "./Admin.module.css";

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className={styles.denied}>
      <h1>Access denied</h1>
      <p>You don’t have permission to view this page.</p>
      <div className={styles.deniedActions}>
        <button type="button" className={styles.deniedPrimary} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        <button type="button" className={styles.deniedGhost} onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );
}
