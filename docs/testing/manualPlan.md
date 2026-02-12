# EEGC Manual Testing Plan

Version: 1.0
Last Updated: 2026-02-06

---

https://docs.google.com/document/d/14-iRexpF2vsATd63SIWTgX2peG4po9CbQ_6YwkLVHiw/edit?tab=t.0 


## Overview

This document provides a step-by-step manual testing plan for the EEGC application. It is intended for non-technical testers (e.g. Simon) to verify all features before the February 25 demo.

**Prerequisites**:
- A teacher account must exist in the Supabase `teachers` table
- At least one student suffix must exist in the `student_whitelist` table
- The application must be running and accessible

---

## Test Area 1: Landing Page

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.1 | Open the app URL in browser | Landing page loads with "EEGC" title, "Welcome Back" message, and two buttons: "Teacher Portal" and "Student Entrance" | |
| 1.2 | Click "Teacher Portal" | Redirected to `/teacher/login` page | |
| 1.3 | Go back to landing page, click "Student Entrance" | Redirected to `/student/login` page | |

---

## Test Area 2: Student Registration (Signup)

**Prerequisite**: Add student suffix `5678` to the `student_whitelist` table in Supabase.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.1 | Navigate to `/student/login`, click "I'm new here" | Redirected to `/student/signup` page with registration form | |
| 2.2 | Leave all fields empty, click "Register & Get My Code" | Error popup: "Please fill in all fields!" | |
| 2.3 | Enter `123` in Student Number field (only 3 digits), fill other fields, submit | Error popup: "Please enter the last 4 digits of your student number." | |
| 2.4 | Enter `12345` in Student Number field (5 digits), fill other fields, submit | Error popup: "Please enter the last 4 digits of your student number." | |
| 2.5 | Enter `abcd` in Student Number field (letters), fill other fields, submit | Error popup: "Please enter the last 4 digits of your student number." | |
| 2.6 | Enter `5678` in Student Number, `J` in Name Prefix (only 1 letter), section `1`, submit | Error popup: "Please enter the first two letters of your name." | |
| 2.7 | Enter `9999` (not in whitelist) in Student Number, `JD` in Name Prefix, section `1`, submit | Warning popup: "Registration Not Allowed" with message about contacting teacher | |
| 2.8 | Enter `5678` (whitelisted) in Student Number, `JD` in Name Prefix, section `1`, submit | Success popup showing unique code in format `5678-JD-XX` (XX = random 2 chars). Code also displayed on page. | |
| 2.9 | Copy the generated code and note it for login testing | Code is visible and copyable | |
| 2.10 | Click "Go to Login" button below the code | Redirected to `/student/login` | |
| 2.11 | Click "Back to Login" link at bottom of signup form | Redirected to `/student/login` | |

---

## Test Area 3: Student Login

**Prerequisite**: Complete Test Area 2 first; have a valid registration code (e.g. `5678-JD-A1`).

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 3.1 | Navigate to `/student/login` | Page shows two options: "I have an ID" and "I'm new here" | |
| 3.2 | Click "I have an ID" | Login form appears with input field for registration code | |
| 3.3 | Leave code field empty, click "Access My Portal" | Warning popup: "Please enter your unique registration code." | |
| 3.4 | Enter an invalid code (e.g. `0000-XX-ZZ`), submit | Error popup: "Login Failed" with "Invalid code or student not found" | |
| 3.5 | Enter a badly formatted code (e.g. `12345`), submit | Error popup: "Login Failed" with format error message | |
| 3.6 | Enter the valid code from Test 2.8, submit | Success popup: "Login Successful" → Redirected to `/eegc` page after 1.5 seconds | |
| 3.7 | Click "Change Option" link at bottom | Returns to the two-option selection screen | |
| 3.8 | Click "Back to Role Selection" link from the selection screen | Returns to landing page `/` | |

---

## Test Area 4: Teacher Login

**Prerequisite**: A teacher account must exist in Supabase `teachers` table (e.g. email: `teacher@hkbu.edu.hk`, password stored in DB).

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 4.1 | Navigate to `/teacher/login` | Login form with email and password fields | |
| 4.2 | Leave both fields empty, click "Login to Portal" | Warning popup: "Please enter both your email and password." | |
| 4.3 | Enter wrong email / wrong password, submit | Error popup: "Login Failed" with "Invalid email or password" | |
| 4.4 | Enter correct email and correct password, submit | Success popup: "Login Successful" → Redirected to `/teacher/dashboard` after 1.5 seconds | |
| 4.5 | Click "Back to Role Selection" link | Returns to landing page `/` | |

---

## Test Area 5: Teacher Dashboard

**Prerequisite**: Logged in as teacher (complete Test Area 4).

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 5.1 | After teacher login, verify dashboard loads | Dashboard shows navigation bar with "Teacher Portal" title and "Sign Out" button | |
| 5.2 | Check statistics section | Shows 4 stat cards: Total Reports, Avg Rating, Training count, Assessment count | |
| 5.3 | Check reports table | Table displays columns for student info, section, mode, rating, date, and action buttons | |
| 5.4 | Click "View" on any report | Modal opens showing report details (chat history, contribution analysis, metadata) | |
| 5.5 | Close the report modal | Modal closes properly | |
| 5.6 | Click "Check Duplicate ID Suffix" button | Duplicate check modal opens, showing any students with the same last-4-digit suffix | |
| 5.7 | Close the duplicate modal | Modal closes properly | |
| 5.8 | Click "Sign Out" | Confirmation dialog appears asking "Are you sure you want to log out?" | |
| 5.9 | Confirm sign out | Redirected to landing page `/` | |

---

## Test Area 6: EEGC Main App — Briefing Mode

**Prerequisite**: Logged in as student (complete Test Area 3).

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 6.1 | After student login, verify `/eegc` page loads | Page shows Course Header, Mode Selector (sidebar), and Briefing Mode content | |
| 6.2 | Verify mode selector shows 3 modes | Briefing, Training, Assessment modes are visible | |
| 6.3 | Default mode should be Briefing | Briefing mode content is displayed with API connection section | |
| 6.4 | Verify API auto-connects on page load | Connection attempt starts automatically. If POE_API_KEY is valid, shows "Connected" notification | |
| 6.5 | If connection fails, verify error notification | Notification appears with error message | |
| 6.6 | After successful connection, click Clear/Reset button | API connection is cleared, status resets to disconnected, chat history is also cleared | |
| 6.7 | Re-connect after clearing | Click connect again, connection re-establishes successfully | |

---

## Test Area 7: EEGC Main App — Training Mode

**Prerequisite**: Successfully connected to API in Briefing mode.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 7.1 | Click "Training" in mode selector | Switches to Training mode, shows tutorial section and Background/Rubrics area | |
| 7.2 | Toggle the training tutorial section | Tutorial content shows/hides correctly | |
| 7.3 | Check pre-filled course information | Background and Rubrics area has pre-filled course info and rubric | |
| 7.4 | Click "Submit" for rubrics | Success popup: "Rubrics Submitted!" with message about training mode pre-fill | |
| 7.5 | After submitting rubrics, chat interface appears | Chat input area is visible with message box and send button | |
| 7.6 | Select a topic (Automation or Migrant) | Topic changes in the essay prompt | |
| 7.7 | Enter an essay draft and confirm it | Original draft is saved; chat becomes interactive | |
| 7.8 | Send a message in chat | AI responds with streaming text (real-time character-by-character display) | |
| 7.9 | Continue conversation with follow-up messages | Chat history grows; AI maintains context | |
| 7.10 | Test the three-step revision guidance flow | AI guides through thesis statement → topic sentences → paragraph content | |

---

## Test Area 8: EEGC Main App — Assessment Mode

**Prerequisite**: API connected, familiar with Training mode.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 8.1 | Click "Assessment" in mode selector | Switches to Assessment mode, shows empty Background/Rubrics form | |
| 8.2 | Verify rubrics form is empty (not pre-filled) | User must manually enter course info and rubrics | |
| 8.3 | Fill in course info and rubrics, click Submit | Success popup: "Rubrics Submitted!" | |
| 8.4 | Enter original draft and confirm | Draft is saved | |
| 8.5 | Complete a full chat revision session | AI provides three-step guidance | |
| 8.6 | Enter final draft and confirm it | Assessment report generation begins | |
| 8.7 | Verify report generation | Report modal opens with chat history, contribution analysis, student info | |
| 8.8 | Submit the report | Report is saved to Supabase `learning_reports` table | |
| 8.9 | Verify the submitted report appears in teacher dashboard | Login as teacher, check dashboard — new report should appear | |

---

## Test Area 9: Report Generation and Export

**Prerequisite**: Complete an assessment session (Test Area 8).

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 9.1 | After confirming final draft, report modal appears | Modal shows complete report with student info, chat history, contribution analysis | |
| 9.2 | Check PDF download option | PDF is generated and downloads to device | |
| 9.3 | Check Markdown export option | Markdown file is generated and downloads | |
| 9.4 | Verify report content accuracy | Chat history matches actual conversation; student info is correct | |
| 9.5 | Submit report with rating and comment | Rating (1-5) and comment are included in submission | |
| 9.6 | Verify "beforeunload" warning | If report has not been submitted, closing the tab shows a warning dialog | |

---

## Test Area 10: Student Logout & Session

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 10.1 | While on `/eegc` page, close the browser tab | "beforeunload" warning appears if report has not been submitted | |
| 10.2 | Clear `userStatus` from browser localStorage manually (dev tools) | Refreshing `/eegc` should redirect to landing page `/` | |
| 10.3 | Switch between Training and Assessment modes during a session | Each mode preserves its own chat history separately; switching back restores the previous mode's history | |

---

## Test Area 11: Session & Security

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 11.1 | Try accessing `/eegc` without logging in | Redirected to landing page `/` (AuthGuard blocks access) | |
| 11.2 | Try accessing `/teacher/dashboard` without logging in | Redirected to landing page `/` | |
| 11.3 | Call `/api/teacher/reports` directly without teacher cookie | Returns 401 Unauthorized | |
| 11.4 | Call `/api/poe-chat` without any auth cookie | Returns 401 Unauthorized | |
| 11.5 | Call `/api/student/submit-report` without student cookie | Returns 401 Unauthorized | |
| 11.6 | After student login, verify JWT cookie is set | Cookie `student_auth` exists (check browser dev tools) | |
| 11.7 | After teacher login, verify JWT cookie is set | Cookie `teacher_auth` exists | |
| 11.8 | Wait 7+ days (or manually expire token), try accessing protected page | Should be rejected and redirected to login | |

---

## Test Area 12: Edge Cases and Error Handling

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 12.1 | Register same student suffix twice with same name prefix | Error: duplicate entry or server error (depends on DB constraint) | |
| 12.2 | Try very long input in chat message | Message is sent without crashing; AI responds normally | |
| 12.3 | Send empty message in chat | Should be prevented or show an appropriate warning | |
| 12.4 | Rapidly click send button multiple times | Should not send duplicate messages; button should disable during processing | |
| 12.5 | Disconnect internet during AI chat | Error notification appears; app does not crash | |
| 12.6 | Switch modes during active chat | Chat history is preserved per mode; switching back restores history | |
| 12.7 | Refresh page during active session | "beforeunload" warning shown if report not submitted | |

---

## Test Area 13: Cross-Browser and Device Testing

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 13.1 | Test on Chrome (latest) | All features work correctly | |
| 13.2 | Test on Firefox (latest) | All features work correctly | |
| 13.3 | Test on Safari (latest) | All features work correctly | |
| 13.4 | Test on mobile browser (iPhone/Android) | Pages are responsive; forms are usable | |
| 13.5 | Test on tablet | Layout adapts properly | |

---

## How to Report Bugs

When you find a bug, please record:

1. **Test ID**: Which test case failed (e.g. "2.7")
2. **Steps to reproduce**: Exactly what you did
3. **Expected result**: What should have happened
4. **Actual result**: What actually happened
5. **Screenshot**: If possible, take a screenshot
6. **Browser**: Which browser you were using
