# UI/UX Design Document
## The Golden Hour: Emergency Referral Failure Navigator

### 1. Design Philosophy
The user interface must be designed for extreme cognitive ease under high stress. Ambulance drivers are operating heavy machinery, often at night, in chaotic environments. 
- **High Contrast**: Dark mode by default to reduce glare at night. High contrast neon colors for critical information.
- **Fat-Finger Friendly**: Massive tap targets (buttons). Minimum reliance on typing; everything should be selectable via large icons/tiles.
- **Zero-Learning Curve**: The interface must be immediately intuitive.
- **3-Tap Rule**: A driver must be able to get a routing recommendation in 3 taps or less.

### 2. Driver App User Flow
#### Screen 1: Emergency Type (Home Screen)
- **Visuals**: 4-6 massive square tiles filling the screen.
- **Tiles**: "Trauma (Red)", "Cardiac (Blue)", "Burns (Orange)", "Maternity (Purple)".
- **Action**: Driver taps the relevant tile.

#### Screen 2: Recommendations Map
- **Visuals**: A simplified dark-themed map centered on the driver's GPS location. 
- **Overlay**: The top 3 recommended hospitals are shown as large floating cards at the bottom of the screen.
- **Card Anatomy**:
  - Hospital Name (Bold, Large)
  - Estimated Time of Arrival (e.g., "6 mins" in Green/Red based on traffic)
  - Reliability Badge (e.g., "98% Reliable" with a gold star or green shield)
  - One-tap "Navigate" button (Integrates with Google Maps).

#### Screen 3: The Truth Loop (Post-Arrival)
- **Visuals**: A simple overlay that appears once GPS detects the ambulance has stopped at the hospital.
- **Prompt**: "Was the patient accepted?"
- **Buttons**: A massive Green "YES" button and a massive Red "TURNED AWAY" button.

### 3. Hospital Admin Web/Tablet Dashboard Flow
#### Screen 1: Status Board
- **Visuals**: A clean, highly visible dashboard designed to be left open on a tablet at the triage desk.
- **Layout**: 
  - **Beds Capacity**: [Green (Available)] [Yellow (Near Full)] [Red (Full)]
  - **Oxygen Supply**: [Green (Available)] [Yellow (Low)] [Red (Out)]
  - **Specialists on Duty**: Toggle switches for [Trauma Surgeon], [Cardiologist], [Neurologist].
- **Action**: Nurses/Admins simply tap the colors to update status in real-time. No forms to fill out.

#### Screen 2: Anonymous Whistleblower (Hidden/Secure Menu)
- **Visuals**: A discreet button in the footer "Report Discrepancy".
- **Action**: Opens a simple modal where a staff member can anonymously report: "System shows beds available, but ward is full." This feeds into the backend Reliability Score without exposing the staff member.

### 4. Color Palette & Typography
- **Background**: #121212 (Deep Gray/Black) for dark mode.
- **Primary Accents**: #00FF00 (Neon Green for Go/Available), #FF0000 (Neon Red for Stop/Full), #FFC107 (Amber for Warning/Near Full).
- **Typography**: Inter or Roboto. Sans-serif, highly legible. Heavy font weights for numbers (ETA, Reliability Score).

### 5. Micro-interactions & Accessibility
- **Haptic Feedback**: Heavy vibration when a hospital status changes to "Red" while en route, notifying the driver to reroute without looking at the screen.
- **Voice Prompts**: "Route updated. City Hospital is now full. Rerouting to Memorial Hospital."
- **High-Contrast Mode**: Built-in toggle for users with visual impairments.
