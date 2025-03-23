# Features

## Core Features

1. **Exercise Selection & Naming**
   - Users can name their own exercises, focusing primarily on compound lifts (e.g., deadlifts, bench press).
   - Each exercise has an associated list of sets and reps.

2. **Workout Data Input**
   - Manual entry for weight, reps, and sets.
   - Ability to duplicate common set/rep patterns (e.g., 5x5, 3x12) to speed up data entry.
   - Placeholders or pre-filled values from previous workouts for quick adjustments.

3. **Progress Tracking & Visualization**
   - Real-time volume calculations.
   - Graphical displays of total volume over time starting from the first workout. There is a slider so the user can
   - **3.5 Feature: Time Range Slider for Chart Display**
      - Overview: Implement an interactive slider for the workout volume chart that allows users to filter the displayed data based on a custom time period. The slider will have two handles representing the start and end dates, enabling users to narrow down the chart to any specific date range. By default, the slider is set to show all available time data.
      - Key Requirements:
         - Dual Handle Slider: The slider should have two movable handles allowing the user to select a start and end date.
         - Default State: When first loaded, the chart displays data for the full time range (i.e., all available workout data).
         - Dynamic Update: As the user adjusts the slider, the chart updates in real time to reflect the selected date range.
         - Visual Feedback: Display the selected date range (start and end dates) above or below the slider for clarity.
         - Responsiveness: Ensure the slider is responsive and works well on various screen sizes.

4. **Settings & Customization**
   - Toggle between metric (kg) and imperial (lb) units.
   - Light and dark mode themes for better accessibility and user preference.

5. **Data Export**
   - Users can export their workout data in CSV or PDF format.

6. **Cloud Storage**
   - Persistent storage ensuring user data is saved and synced across devices.

7. **Future Mobile Expansion**
   - Planned integration with a React Native app for on-the-go tracking.
   - Potential wearable integration (smartwatches, fitness trackers).
