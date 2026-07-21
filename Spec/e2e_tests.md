# E2E Test Document

Pickleball Tracking App end-to-end tests covering interactions between the React frontend and Node.js/Express backend.

1. Introduction
   This document outlines end-to-end tests for the Pickleball Tracking App that cover interactions between the React frontend and Node.js/Express backend.

2. Test Cases

   - Navigation:
     1. Test Case N-01 (BottomTabBar on Mobile)
        - Steps:
          1. Open the app on a mobile device.
          2. Tap each tab (Dashboard, Leaderboard, Games, Friends, Add Game).
          3. Verify the active tab is highlighted and visually distinct.
        - Expected Result:
          - The app should display the Dashboard on initial load.
          - Each tab navigation should animate to the corresponding screen.

     2. Test Case N-02 (Top NavBar on Desktop)
        - Steps:
          1. Open the app in a desktop browser.
          2. Resize the window to a viewport ≥ 768px.
        - Expected Result:
          - The top NavBar appears and is functional.

   - Theme:
     1. Test Case T-01 (Light/Dark Theme Switch)
        - Steps:
          1. Open the app and verify the default theme.
          2. Toggle the theme to dark mode.
          3. Verify the html tag has class="dark".
          4. Toggle back to light mode.
        - Expected Result:
          - The theme should toggle immediately and persist between sessions.

   - Dashboard:
     1. Test Case D-01 (Fetch Players)
        - Steps:
          1. Navigate to the Dashboard.
          2. Verify all player stats are fetched and displayed.
        - Expected Result:
          - The player count, games count, and top-ranked player should be displayed.

   - Leaderboard:
     1. Test Case L-01 (Fetch Players and Sort)
        - Steps:
          1. Navigate to the Leaderboard.
          2. Verify all players are fetched and displayed in descending order by rankScore.
          3. Sort the leaderboard by win rate and games played.
        - Expected Result:
          - The players should be sorted correctly and displayed.

   - Player Profile:
     1. Test Case PR-01 (Fetch Player)
        - Steps:
          1. Navigate to a player's profile by clicking on their name in the leaderboard.
          2. Verify the player's stats are displayed correctly.
        - Expected Result:
          - The user should be able to view detailed stats and game history.

   - Games Screen:
     1. Test Case G-01 (Fetch Games)
        - Steps:
          1. Navigate to the Games screen.
          2. Verify all games are fetched and displayed with correct details.
          3. Filter by player UID.
        - Expected Result:
          - The games should be sorted and displayed correctly.

   - Friends Screen:
     1. Test Case FR-01 (Manage Friend Requests)
        - Steps:
          1. Navigate to the Friends screen.
          2. Send a friend request to another user.
          3. Accept or reject the request.
        - Expected Result:
          - The friend request should be sent, accepted, or rejected as expected.

   - Add Game:
     1. Test Case AG-01 (Log a New Game)
        - Steps:
          1. Navigate to the Add Game screen.
          2. Select at least two players and enter a score.
          3. Enter the game location or use "Detect My Location".
          4. Submit the form.
        - Expected Result:
          - The game should be logged, and a success message should appear.

   - System Verification:
     1. Ensure all tests pass without error.
     2. Verify the app behaves as expected across different screen sizes and themes.

3. Non-Functional Requirements
   Ensure all tests cover performance, security, and reliability checks as defined in the functional requirements.