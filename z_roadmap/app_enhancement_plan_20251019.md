### **A Plan to Improve `describeAT`**

Our guiding principle will be: **"Every feature must be designed and evaluated based on a seamless, audio-first experience."**

The plan is broken into three phases, moving from foundational reliability to advanced, delight-driven features.

#### **Phase 1: Solidifying the Core Experience & Reliability**

This phase is about making the app's core promises robust and completely trustworthy for a user who relies on it.

1.  **Implement Real-Time Audio Sync:**
    *   **Problem:** The app's cornerstone "Sync" feature is currently a mock. This is the highest priority.
    *   **Plan:**
        *   Integrate a real audio fingerprinting service (e.g., ACRCloud or a custom backend).
        *   The API response must provide not just the matched `titleId`, but also a precise `timestamp` of the match.
        *   The audio player will be modified to start the AD track playback from this exact timestamp, ensuring perfect synchronization.
        *   **Crucially for blind users, we will add clear audio and ARIA live region announcements for each state:**
            *   *"Starting sync..."*
            *   *"Listening for audio from your TV or speaker..."*
            *   *"Analyzing... Found a match: Kandasamys The Wedding."*
            *   *"Syncing playback."*
            *   *"Error: No match was found. Please try again in a quieter environment."*

2.  **Enhance Screen Reader and Accessibility UX:**
    *   **Problem:** While basic ARIA tags are present, the dynamic nature of the app can be confusing for screen readers without more explicit guidance.
    *   **Plan:**
        *   **Implement ARIA Live Regions:** Announce important on-screen changes, such as when a track is added to the queue ("Added to queue"), when playback starts/stops, or when content is loading.
        *   **Improve Focus Management:** Ensure that when a modal (like "Up Next" or "Search") is opened, focus is programmatically moved to the first interactive element inside it. When closed, focus must return to the element that opened it.
        *   **Descriptive Element Text:** Enhance labels for clarity. Instead of a "Play" button being announced as just "play," it will be announced as *"Play English AD for Kandasamys: The Wedding."*
        *   **Make Carousels Skimmable:** For long horizontal lists of titles, which are tedious to navigate with a screen reader, we will add a "Skip to the next section" link that is only visible to screen reader users.

3.  **Implement a True Offline Download System:**
    *   **Problem:** The current offline capability is for data (like titles), not the actual audio track files. A user might be on a train or in a cinema with no signal and find the app unusable.
    *   **Plan:**
        *   Add a "Download AD Track" button on the title detail page.
        *   Create a "Downloads" section in the Main Menu where users can manage their saved tracks.
        *   Downloaded tracks will be stored reliably on the device using the File System Access API or IndexedDB. The app will always prioritize playing the downloaded file if available.

---

#### **Phase 2: Enhancing Usability & Control**

This phase focuses on refining the user interface to provide more power and flexibility, tailored to non-visual interaction.

1.  **Overhaul the Player for Advanced Control:**
    *   **Problem:** The current player has basic controls. Users often need more granular control over audio.
    *   **Plan:**
        *   **Granular Seeking:** The visual scrubber is difficult to use without sight. We will enhance the existing "Rewind" and "Forward" buttons and make their intervals configurable in preferences (e.g., skip back 10s, 15s, or 30s).
        *   **"Jump To..." Feature:** Add a feature in the player options to jump to a specific minute/second or percentage of the track via a simple input field.
        *   **Volume Boost:** Add an option to increase the volume of the AD track relative to the main audio source.

2.  **Create an Accessible Onboarding Experience:**
    *   **Problem:** A new user may not understand the unique "Sync" feature without visual cues.
    *   **Plan:**
        *   On the first launch, initiate a brief, audio-led, interactive tutorial.
        *   Example script: *"Welcome to describeAT. To get started, let's try syncing with your TV. When you're ready, tap the large hexagonal button at the bottom center of your screen."* This makes the core functionality clear from the start.

---

#### **Phase 3: Advanced & "Delight" Features**

This phase introduces powerful new ways to interact with the app, transforming it into an intelligent audio companion.

1.  **Implement Voice Commands:**
    *   **Problem:** Physical interaction is not always convenient. Voice control would be a massive accessibility win.
    *   **Plan:**
        *   Integrate the Web Speech API to enable voice commands.
        *   Implement a library of core commands, such as:
            *   *"describeAT, sync my movie."*
            *   *"describeAT, pause playback."*
            *   *"describeAT, search for Beyond the River."*
            *   *"describeAT, what's in my queue?"*

2.  **Smart Recommendations & Discovery:**
    *   **Problem:** Discovering new content can be difficult without browsing visually.
    *   **Plan:**
        *   Enhance the "Home" page with algorithmically generated, clearly announced sections like:
            *   *"Because you listened to 'Beyond the River', you might also like 'The Road Less Cycled'."*
            *   *"New in South African Comedy this week..."*
