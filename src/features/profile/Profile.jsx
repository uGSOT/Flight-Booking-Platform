import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyProfile, saveMyProfile } from "../../lib/db.js";
import { User, Calendar, Mail, Phone, Chevron } from "../../components/icons.jsx";
import profileImg from "../../assets/images/auth-side.png";
import styles from "./Profile.module.css";

const empty = { firstName: "", lastName: "", dob: "", gender: "", email: "", phone: "", company: "", gstin: "" };

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...empty, phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const p = await getMyProfile(user?.phone);
      if (active && p) setForm((f) => ({ ...f, ...p, phone: p.phone || user?.phone || "" }));
    })();
    return () => { active = false; };
  }, [user?.phone]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function save() {
    setError("");
    if (!form.gender) { setError("Please select a gender."); return; }
    if (!form.phone.trim()) { setError("Phone number is required."); return; }
    try {
      await saveMyProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Could not save profile.");
    }
  }

  return (
    <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <h1 className={styles.title}>Profile</h1>

      <div className={styles.layout}>
        <div className={styles.form}>
          <section>
            <h2 className={styles.section}>Personal details</h2>
            <div className={styles.grid}>
              <Field label="First Name"><span className={styles.inputRow}><User size={16} /><input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Enter first name" /></span></Field>
              <Field label="Last Name"><span className={styles.inputRow}><User size={16} /><input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Enter last name" /></span></Field>
              <Field label="Date of Birth"><span className={styles.inputRow}><Calendar size={16} /><input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></span></Field>
              <Field label="Gender" required><span className={styles.inputRow}><select value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select><Chevron size={16} /></span></Field>
            </div>
          </section>

          <section>
            <h2 className={styles.section}>Contact details</h2>
            <div className={styles.grid}>
              <Field label="Email ID"><span className={styles.inputRow}><Mail size={16} /><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Enter email address" /></span></Field>
              <Field label="Phone Number" required><span className={styles.inputRow}><Phone size={16} /><input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Enter phone number" /></span></Field>
            </div>
          </section>

          <section>
            <h2 className={styles.section}>GSTIN details <small>(Optional)</small></h2>
            <div className={styles.grid}>
              <Field label="Company Name"><span className={styles.inputRow}><input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Enter company name" /></span></Field>
              <Field label="GSTIN Number"><span className={styles.inputRow}><input value={form.gstin} onChange={(e) => set("gstin", e.target.value)} placeholder="Enter GSTIN number" /></span></Field>
            </div>
          </section>

          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.save} onClick={save}>Save changes</button>
            {saved && <span className={styles.savedMsg}>✓ Profile saved</span>}
          </div>
        </div>

        <div className={styles.imageCol}>
          <img src={profileImg} alt="" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label} {required && <em>*</em>}</span>
      {children}
    </label>
  );
}
