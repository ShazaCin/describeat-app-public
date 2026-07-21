# describeAT Application Development Roadmap

## Vision

To create the world's most intuitive, reliable, and accessible audio description (AD) application. Our north star is to empower visually impaired users with a seamless and enriching media experience, ensuring they can enjoy content synchronously and independently, whether online or offline.

---

## Phase 1: Foundational Enhancements & Core Feature Realization

*Focus: Transitioning from a prototype to a robust, production-ready application by implementing core services and bolstering accessibility and offline capabilities.*

### 1. **Service Worker Implementation for True Offline-First Experience**
   - **Goal:** Ensure the app is fully functional without an internet connection after the initial data load.
   - **Tasks:**
     - **App Shell Caching:** Cache the main HTML, CSS, JavaScript bundles, and static assets.
     - **API Response Caching:** Cache responses from the GraphQL API for titles and AD tracks. Use a stale-while-revalidate strategy to keep data fresh when online.
     - **Image Caching:** Cache poster and backdrop images.
     - **Background Sync:** Implement background sync for queued actions like submitting feedback, ensuring they are sent once connectivity is restored.

### 2. **Real-time Audio Sync Implementation**
   - **Goal:** Replace the mock sync functionality with a real audio fingerprinting and matching service.
   - **Tasks:**
     - **Backend Integration:** Define the API contract and integrate with an audio fingerprinting service (e.g., ACRCloud or a custom solution).
     - **Timestamp Synchronization:** The API response must include not only the `titleId` but also the precise `timestamp` of the match within the media.
     - **Playback Offset:** The player must start the AD track at the received timestamp to achieve perfect sync.
     - **Graceful Error Handling:** Implement a clear and helpful UI for scenarios like "No Match Found," "Ambient Noise Too High," or "Network Error."
     - **Re-Sync Feature:** Allow users to easily trigger a re-sync if the audio drifts out of sync.

### 3. **Advanced Accessibility & Usability**
   - **Goal:** Exceed standard accessibility compliance to create a truly delightful experience for screen reader users.
   - **Tasks:**
     - **Full Keyboard Navigation:** Ensure every interactive element is focusable and operable via a keyboard. Implement logical focus order and visible focus rings.
     - **ARIA Live Regions:** Use ARIA live regions to announce dynamic content changes, such as player status ("Playing Kandasamys: The Wedding"), sync progress ("Matching... 60%"), and error messages.
     - **Enhanced Screen Reader Text:** Provide descriptive `aria-label` attributes for all controls, especially icon-only buttons. For example, the play button on a title card should announce "Play Kandasamys: The Wedding, English AD + Soundtrack."
     - **User-configurable Settings:** Add preferences for font size adjustment and a high-contrast theme.

### 4. **Robust Search Functionality**
   - **Goal:** Implement a fast and accurate search feature that works offline.
   - **Tasks:**
     - **Local Full-Text Search:** Utilize Dexie.js's capabilities to implement a client-side search across titles, synopses, actors, and genres.
     - **UI Implementation:** Connect the search UI to the local search logic, providing instant results as the user types.
     - **Federated Search (Future):** Plan for a federated search that queries the local DB first, then falls back to a server-side search for new content.

---

## Phase 2: User Experience & Engagement

*Focus: Refining the user interface, adding personalization features, and making the media player more powerful.*

### 1. **Player V2 Enhancements**
   - **Goal:** Upgrade the media player with essential accessibility and convenience features.
   - **Tasks:**
     - **Playback Speed Control:** Implement controls to adjust playback speed (e.g., 0.75x, 1x, 1.25x, 1.5x, 2x).
     - **Quick Skip Controls:** Add buttons for skipping back 15 seconds and forward 30 seconds.
     - **Sleep Timer:** Allow users to set a timer to automatically stop playback.
     - **Improved Scrubber Accessibility:** Ensure the progress bar (scrubber) is fully accessible, allowing users to seek using screen reader gestures or keyboard commands.

### 2. **User Profiles & Listening History**
   - **Goal:** Personalize the experience and help users keep track of their activity.
   - **Tasks:**
     - **Local History:** Store a user's listening history in IndexedDB.
     - **"Continue Listening" Section:** Add a prominent section on the Home Page showing recently played titles.
     - **Authentication (Optional):** Plan for an optional cloud-based profile to sync history and preferences across devices.

### 3. **UI/UX Polish and Onboarding**
   - **Goal:** Smooth out rough edges in the UI and make the app easier for new users to understand.
   - **Tasks:**
     - **Skeleton Loading States:** Replace generic "Loading..." text with skeleton screens that mimic the layout of the content being loaded, improving perceived performance.
     - **First-Time User Onboarding:** Create a brief, accessible tutorial on first launch that explains the core features, with a special focus on how the "Sync" button works.
     - **Haptic Feedback:** On supported devices, provide subtle haptic feedback for key interactions like starting a sync or playing a track.

---

## Phase 3: Advanced Features & Ecosystem Growth

*Focus: Building out features that encourage content discovery, long-term engagement, and expand the app's utility.*

### 1. **Content Discovery & Recommendations**
   - **Goal:** Help users discover new and relevant content.
   - **Tasks:**
     - **Personalized Recommendations:** Based on listening history, implement "Because you listened to..." and "You might also like..." sections.
     - **Curated Carousels:** Add editorially curated sections like "Newly Added," "Trending This Week," and "Award Winners."

### 2. **Voice Commands**
   - **Goal:** Enable hands-free control of the application for maximum accessibility.
   - **Tasks:**
     - **Integration:** Use the Web Speech API for voice recognition.
     - **Command Library:** Implement core commands like "Play," "Pause," "Sync my screen," "Search for [Title]," and "Next track."

### 3. **Offline Content Downloads**
   - **Goal:** Allow users to save AD tracks for offline use without relying on automatic caching.
   - **Tasks:**
     - **Download Manager:** Build a UI to manage downloads, view progress, and see saved content.
     - **Storage Management:** Store AD track audio files in IndexedDB or the Cache API and provide users with information on storage usage.

### 4. **Push Notifications**
   - **Goal:** Proactively engage users with relevant updates.
   - **Tasks:**
     - **Opt-In Mechanism:** Implement a clear way for users to opt into notifications.
     - **Notification Triggers:** Send notifications for events like "A new AD track is available for a title in your history" or "New popular movies have been added."
