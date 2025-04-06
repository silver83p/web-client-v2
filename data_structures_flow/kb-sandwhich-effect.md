# Sandwich Effect Implementation Checklist

## Overview

This checklist outlines the steps to implement a "sandwich" layout where:

- Header remains fixed at the top
- Content area adjusts dynamically
- Input/footer stays above the on-screen keyboard
- Implementation works consistently across both Android and iOS

## Research & Analysis

- [x] Understand platform differences between Android and iOS keyboard behaviors
- [x] Identify the viewport meta tag options (`interactive-widget`) and their compatibility
- [x] Research Visual Viewport API support across browsers

## Implementation Checklist

### 1. Meta Tag Configuration

- [x] Add `interactive-widget=resizes-content` to the viewport meta tag
- [x] Test if this property affects iOS behavior (expected: it will be ignored)

### 2. HTML Structure Updates

- [ ] Review current modal HTML structure (chat modal, etc.)
- [ ] Ensure proper nesting of header, content area, and footer
- [ ] Verify that modals follow the same structural pattern for consistency

### 3. CSS Modifications

- [ ] Update fixed header styling to ensure it stays at the top
- [ ] Set content area to be scrollable and adjust between header and footer
- [ ] Configure footer/input area with proper positioning
- [ ] Add transition effects for smooth keyboard appearance/disappearance

### 4. JavaScript Implementation

- [ ] Implement Visual Viewport API listeners for resize and scroll events
- [ ] Create function to calculate keyboard height (window.innerHeight - viewport.height)
- [ ] Add logic to adjust footer position when keyboard appears
- [ ] Implement content area adjustments to prevent input field from being hidden
- [ ] Add logic to scroll active input into view when keyboard appears

### 5. Testing

- [ ] Test on Android Chrome (latest version)
- [ ] Test on iOS Safari (latest version)
- [ ] Verify chat input behavior when keyboard appears/disappears
- [ ] Test with different input field positions (top, middle, bottom of screen)
- [ ] Verify that scrolling works properly when keyboard is visible

### 6. Edge Cases & Refinements

- [ ] Handle landscape vs. portrait orientation changes
- [ ] Address device-specific quirks (notches, home indicators)
- [ ] Implement fallbacks for browsers without Visual Viewport API
- [ ] Optimize transitions for performance
- [ ] Add debouncing for viewport event handlers

### 7. Final Integration

- [ ] Apply solution to all modals with input fields
- [ ] Document the implementation approach for future reference
- [ ] Create a test plan for QA to verify behavior across devices
