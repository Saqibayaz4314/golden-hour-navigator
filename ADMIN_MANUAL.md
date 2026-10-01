# 🏥 Golden Hour Navigator - Admin & Staff Manual

Welcome to the **Hospital Dashboard**. This portal is restricted to authorized hospital staff and administrators. Your role is critical: keeping your hospital's data accurate ensures that ambulances do not waste precious time routing critical patients to full wards.

---

## 1. Logging In
1. Navigate to `/login` (or click "Staff Login" in the navigation bar).
2. Enter your assigned hospital credentials.
   *(Demo Credentials: Email: `staff@civil.com` / Password: `staff123`)*
3. Once logged in, you will be redirected to your **Hospital Dashboard**.

---

## 2. Managing Hospital Resources (Live Status)
Your primary responsibility is keeping the bed and oxygen status accurate.

1. On the dashboard, locate the **"Live Resource Status"** section.
2. **Beds Available:** Enter the exact number of empty beds.
3. **Bed Status:** 
   - 🟢 **Green (Available):** Plenty of space.
   - 🟡 **Yellow (Near Full):** Approaching capacity.
   - 🔴 **Red (Full):** Do NOT accept patients. Ambulances will be routed elsewhere.
4. **Oxygen Status:** Update to Green, Yellow, or Red.
5. Tap **"Update Status"**. This instantly updates the database and reflects on all driver devices city-wide.

---

## 3. Managing Doctor Duty Roster
Doctors often have schedules across multiple hospitals. You must verify who is actually physically present.

1. Scroll down to the **"Doctors on Duty"** section.
2. You will see a list of doctors affiliated with your hospital.
3. **Green Toggle (On Duty):** If the doctor is currently in the building, turn this ON.
4. **Grey Toggle (Off Duty):** If the doctor has left for the day or is at a private clinic, turn this OFF.
5. *Note: The system automatically checks a doctor's scheduled slots. However, manual toggles override the schedule for unexpected absences or overtime.*

---

## 4. Understanding Your "Reliability Score"
At the top of your dashboard, you will see your hospital's **Trust / Reliability Score** (0-100%).

- **How it goes up:** Every time a routed ambulance successfully admits a patient at your hospital, your score increases (+1).
- **How it goes down:** If you claim to have beds (Status: Green), but an ambulance arrives and is turned away, the driver will report it. Your score will drop significantly (-5).
- **Why it matters:** The system's "Best Match" algorithm prioritizes hospitals with high reliability scores. If your score drops too low, you will stop receiving patients entirely.

---

## 5. The Anonymous Whistleblower Tool
If you notice that your hospital administration is forcing staff to mark beds as "Available" when the hospital is actually full (to secure government funding or insurance quotas), you can report it safely.

1. Click the red **"Report Discrepancy"** button.
2. Write a brief note explaining the fake data.
3. Submit.
4. **This report is 100% anonymous.** It strips your user ID and logs a flag directly to the central health authority database.
