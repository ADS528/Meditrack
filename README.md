
# MediTrack – Medicine Reminder System 💊

MediTrack is a privacy-first, offline-capable digital health companion designed to help users manage their medication schedules, track adherence, and organize doctor appointments. Built with a focus on simplicity and performance, it demonstrates a clean, responsive UI with robust client-side logic.

## 🚀 Key Features

*   **Smart Dashboard**: Instantly view today's medication schedule. The system automatically filters out medicines that haven't started or have ended.
*   **Adherence Analytics**: Visual Pie Chart showing "Taken" vs "Missed" stats for the current day to motivate users.
*   **Flexible Scheduling**: Support for complex schedules (Once daily, Twice daily, or Custom specific times).
*   **History Log**: Immutable record of past doses. Useful for showing doctors actual adherence vs. prescribed schedule.
*   **Doctor Appointments**: A dedicated section to manage upcoming visits and medical notes.
*   **Smart Notifications**: Browser-based push notifications alert users when a dose is due, even if the app is in the background.
*   **Privacy-Focused**: All data is stored locally on the device (LocalStorage). No sensitive health data leaves your browser.
*   **Offline Capable**: Zero-latency interactions and full functionality without an internet connection.

## 🛠️ Tech Stack

*   **Frontend**: React 18
*   **Language**: TypeScript (Strict typing for medical data reliability)
*   **Build Tool**: Vite (Lightning-fast development server)
*   **Styling**: Tailwind CSS (Responsive, mobile-first design)
*   **Visualization**: Recharts (Data charts)
*   **Icons**: Lucide React
*   **State/Storage**: LocalStorage with a Service Facade Pattern

## 📦 Installation & Run

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd meditrack
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the App**
    ```bash
    npm run dev
    ```

4.  **View**
    Open `http://localhost:5173` in your browser.

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, etc.)
├── pages/            # Main screens (Dashboard, Login, History, Appointments)
├── services/         # API abstraction layer (Handles LocalStorage logic)
├── types/            # TypeScript interfaces (Medicine, User, DoseLog)
├── App.tsx           # Main application wrapper and routing logic
└── index.tsx         # Entry point
```

## 🧠 Technical Highlights

### 1. The "Today" Filter Logic
The dashboard doesn't just dump all data. It uses a specific algorithm in `Dashboard.tsx` to:
1.  Get the current system date in ISO format.
2.  Filter medicines where `Today >= StartDate` AND `Today <= EndDate`.
3.  Compare `CurrentTime` vs `ScheduledTime` to auto-mark doses as "Missed" if the window has passed.

### 2. Service Layer Abstraction
We avoided writing `localStorage.getItem` directly in our React components. Instead, we created `services/api.ts`.
*   This file mimics a real async backend using `Promise` and artificial delays (`setTimeout`).
*   **Why?** This allows us to swap LocalStorage for a real database (like Firebase or PostgreSQL) in the future *without* changing a single line of the frontend UI code.

### 3. Behavioral Heuristics
The app includes a simple habit-tracking algorithm. If it detects that a user consistently marks "Taken" more than 60 minutes after the scheduled time, it triggers a "Late Warning" UI element to nudge the user toward better habits.

## 🔮 Future Roadmap

*   **Cloud Sync**: Optional account upgrading to sync data across devices.
*   **Drug Interaction API**: Integration with OpenFDA to warn users if two meds conflict.
*   **Refill Tracking**: Inventory system to count down remaining pills.
*   **Caregiver Mode**: Allow family members to view adherence stats remotely.
