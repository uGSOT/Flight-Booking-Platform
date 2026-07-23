import { useEffect, useRef, useState } from "react";
import Modal from "../../components/Modal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { requestOtp, verifyOtp } from "../../lib/auth.js";
import { toast } from "../../lib/toast.js";
import { ArrowLeft } from "../../components/icons.jsx";
import authSide from "../../assets/images/auth-side.png";
import styles from "./AuthModal.module.css";

const OTP_LEN = 6;

export default function AuthModal({ open, onClose, onSuccess }) {
  const { setUser } = useAuth();
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const boxRefs = useRef([]);

  useEffect(() => {
    if (!open) {
      setStep("phone"); setPhone(""); setDigits(Array(OTP_LEN).fill("")); setError(""); setSeconds(0);
    }
  }, [open]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function sendOtp() {
    setError("");
    if (phone.replace(/\D/g, "").length < 10) { setError("Enter a valid 10-digit mobile number."); return; }
    setBusy(true);
    await requestOtp({ dialCode: "+91", phone });
    setBusy(false);
    setStep("otp");
    setSeconds(24);
    setTimeout(() => boxRefs.current[0]?.focus(), 50);
  }

  function setDigit(i, v) {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => prev.map((x, idx) => (idx === i ? d : x)));
    if (d && i < OTP_LEN - 1) boxRefs.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxRefs.current[i - 1]?.focus();
  }

  function onPaste(e) {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LEN).fill("");
    text.split("").forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    boxRefs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  }

  async function verify() {
    setError("");
    const code = digits.join("");
    if (code.length < OTP_LEN) { setError("Enter the 6-digit OTP."); return; }
    setBusy(true);
    try {
      const { user } = await verifyOtp({ dialCode: "+91", phone, code });
      setUser(user);
      setBusy(false);
      toast.success("You're logged in.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setBusy(false);
      setError(err.message);
      toast.error(err.message || "Could not verify the OTP.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className={styles.wrap}>
        <div className={styles.side} style={{ backgroundImage: `url(${authSide})` }} aria-hidden="true" />
        <div className={styles.panel}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>

          {step === "phone" ? (
            <>
              <h2 className={styles.title}>Login or Create Account</h2>
              <p className={styles.sub}>Enter your mobile number to continue</p>
              <div className={styles.phoneRow}>
                <span className={styles.dial}>+91 ▾</span>
                <input
                  className={styles.phoneInput}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  placeholder="Enter phone number"
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="button" className={styles.primary} onClick={sendOtp} disabled={busy}>
                {busy ? "Sending…" : "Get OTP"}
              </button>
            </>
          ) : (
            <>
              <h2 className={styles.title}>Verify Your Number</h2>
              <p className={styles.sub}>We've sent a 6-digit OTP to</p>
              <p className={styles.phoneShown}>+91 {phone}</p>
              <div className={styles.otpRow} onPaste={onPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (boxRefs.current[i] = el)}
                    className={styles.otpBox}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                  />
                ))}
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.resendRow}>
                {seconds > 0 ? (
                  <span><strong>00:{String(seconds).padStart(2, "0")}</strong> OTP will expire in</span>
                ) : (
                  <span>Didn't receive the code?</span>
                )}
                <button type="button" className={styles.link} disabled={seconds > 0} onClick={sendOtp}>Resend OTP</button>
              </div>
              <button type="button" className={styles.changeNumber} onClick={() => setStep("phone")}>
                <ArrowLeft size={16} /> Change Number
              </button>
              <button type="button" className={styles.primary} onClick={verify} disabled={busy}>
                {busy ? "Verifying…" : "Verify & Continue"}
              </button>
            </>
          )}

          <div className={styles.terms}>
            By continuing, you agree to our <a href="#!">Terms of Use</a> and <a href="#!">Privacy Policy</a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
