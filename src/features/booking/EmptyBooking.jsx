import { useNavigate } from "react-router-dom";
import styles from "./ReviewDetails.module.css";

/** Shown when a booking step is opened without a selected flight in the draft. */
export default function EmptyBooking() {
  const navigate = useNavigate();
  return (
    <div className={styles.empty}>
      <strong>No flight selected</strong>
      <p>Start by searching for a flight to continue your booking.</p>
      <button type="button" onClick={() => navigate("/")}>Search flights</button>
    </div>
  );
}
