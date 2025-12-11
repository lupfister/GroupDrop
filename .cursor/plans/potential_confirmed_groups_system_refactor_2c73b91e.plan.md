---
name: Potential Confirmed Groups System Refactor
overview: Refactoring the potential and confirmed groups system to allow multi-group membership, dynamic proximity-based groups, and prevent unconfirming from confirmed groups
todos:
  - id: remove-exclusion-updatePotentialGroups
    content: Remove exclusion logic from updatePotentialGroups() - allow phones in confirmed groups to participate in proximity detection
    status: completed
  - id: remove-exclusion-calculateProximityData
    content: Remove exclusion logic from calculateProximityData() - allow proximity calculation for all phones regardless of confirmed group status
    status: completed
  - id: update-handleConfirm-multi-group
    content: Update handleConfirm() to allow phones to confirm in multiple potential groups simultaneously, even if already in confirmed groups
    status: completed
  - id: refactor-dynamic-cleanup
    content: Refactor updatePotentialGroups() cleanup logic to verify all members are still within proximity threshold, not just check for active members
    status: completed
  - id: remove-confirmedIds-preservation
    content: Remove confirmedIds preservation when groups break proximity - confirmation state should be lost when phones move apart
    status: completed
  - id: update-handleUnconfirm-prevention
    content: Update handleUnconfirm() to prevent unconfirming if phone is in any confirmed group - add early return check
    status: completed
  - id: remove-confirmed-group-deletion
    content: Remove logic in handleUnconfirm() that deletes confirmed groups when a phone unconfirms
    status: completed
  - id: verify-ui-unconfirm-prevention
    content: Verify and strengthen UI prevention of unconfirming in PhoneWithProximity.tsx - ensure all unconfirm paths check for confirmed groups
    status: completed
---

# Potential and Confirmed Groups System Refactor

## Overview

This document outlines the changes needed to refactor the potential and confirmed groups system to make it more logical and flexible.

## Change 1: Allow Phones in Confirmed Groups to Join New Groups

### Current Behavior

- Phones in confirmed groups are **excluded** from proximity detection
- `getPhonesInConfirmedGroups()` returns all phones in confirmed groups
- `updatePotentialGroups()` filters out phones in confirmed groups (line 588)
- `calculateProximityData()` skips phones in confirmed groups (line 759)
- Phones cannot form new groups while in a confirmed group

### Proposed Behavior

- Phones in confirmed groups **can** join new potential groups
- Phones can be in **multiple confirmed groups simultaneously**
- New group formation does not affect existing confirmed groups
- When a phone in a confirmed group confirms in a new potential group, they join the new confirmed group while remaining in all existing ones

### Implementation Changes

**File: `src/imports/Desktop1.tsx`**

1. **Remove exclusion from `updatePotentialGroups()`** (line 585-588):

- Remove: `const phonesInConfirmedGroups = getPhonesInConfirmedGroups();`
- Remove: `const activeBodies = bodiesRef.current.filter(body => !phonesInConfirmedGroups.has(body.id));`
- Change to: `const activeBodies = bodiesRef.current;`
- Update cleanup logic to work with all bodies, not just non-confirmed ones

2. **Remove exclusion from `calculateProximityData()`** (lines 756-761):

- Remove the early return that skips phones in confirmed groups
- Allow proximity calculation for all phones regardless of confirmed group status

3. **Update `handleConfirm()`** (lines 503-523):

- Remove any checks that prevent confirmation if phone is already in a confirmed group
- Allow phones to confirm in multiple potential groups simultaneously

4. **Keep `getPhonesInConfirmedGroups()`** but only use it for:

- UI display purposes (showing which phones are in confirmed groups)
- Not for exclusion logic

---

## Change 2: Make Potential Group Detection Dynamic and Proximity-Based

### Current Behavior

- Potential groups persist even after phones move apart
- Groups are only cleaned up when they have no "active members" (line 712-714)
- Confirmation state (`confirmedIds`) is preserved when groups are updated (line 698)
- Many stale potential groups can accumulate as phones move around

### Proposed Behavior

- Potential groups **only exist when phones are actually in proximity**
- When phones move apart and break proximity, the potential group is **immediately removed**
- Confirmation state within a potential group is **lost** when phones move apart
- Phones must reconfirm when they come back into proximity
- Potential groups are dynamically created/destroyed based on real-time proximity

### Implementation Changes

**File: `src/imports/Desktop1.tsx`**

1. **Refactor `updatePotentialGroups()` cleanup logic** (lines 706-724):

- Instead of checking if group has "active members", verify that **all members are still within proximity of each other**
- For each existing potential group, recalculate if all members are still within the proximity threshold
- If any member is no longer within proximity of the group, **delete the entire group** (including its `confirmedIds`)
- Use a more aggressive cleanup that checks actual proximity, not just membership

2. **Change group matching logic** (lines 681-701):

- When finding existing groups, verify they still meet proximity requirements
- Don't preserve `confirmedIds` if the group structure has changed (members moved apart)
- Only preserve `confirmedIds` if the exact same members are still in proximity

3. **Update cleanup to verify proximity**:

- After creating/updating groups, iterate through all existing potential groups
- For each group, check if all members are still within `PROXIMITY_THRESHOLD_CM` of each other
- If not, remove the group entirely (don't preserve `confirmedIds`)

---

## Change 3: Prevent Unconfirming from Confirmed Groups

### Current Behavior

- `handleUnconfirm()` removes phone from `confirmedPhones` set (line 527-531)
- `handleUnconfirm()` removes phone from `confirmedIds` in potential groups (lines 533-547)
- `handleUnconfirm()` **deletes entire confirmed groups** when a phone unconfirms (lines 549-558)
- UI partially prevents unconfirming (line 309 checks for confirmed group) but the backend still allows it

### Proposed Behavior

- Once a phone is in a confirmed group, they **cannot unconfirm from it**
- Confirmed groups are **permanent** once formed
- `handleUnconfirm()` should check if phone is in any confirmed groups and **prevent unconfirmation**
- UI should completely prevent unconfirm action when in a confirmed group

### Implementation Changes

**File: `src/imports/Desktop1.tsx`**

1. **Update `handleUnconfirm()`** (lines 526-559):

- Add check at the start: if phone is in any confirmed group, return early without doing anything
- Remove the logic that deletes confirmed groups (lines 549-558)
- Keep the logic for removing from `confirmedPhones` and potential group `confirmedIds` (only if not in confirmed group)

**File: `src/components/PhoneWithProximity.tsx`**

2. **Strengthen UI prevention** (lines 300-316):

- The check at line 309 already prevents unconfirming if in confirmed group
- Verify this is working correctly and covers all unconfirm paths
- Ensure back button logic (lines 1122-1130) properly prevents unconfirming

---

## Data Structure Changes

No changes to the core data structures are needed:

- `PotentialGroup` interface remains the same
- `ConfirmedGroup` interface remains the same
- State management structure remains the same

## Testing Considerations

1. **Multi-group membership**: Test that a phone can be in multiple confirmed groups simultaneously
2. **Dynamic groups**: Test that potential groups disappear immediately when phones move apart
3. **Confirmation loss**: Test that confirmation state is lost when proximity breaks
4. **Permanent confirmed groups**: Test that confirmed groups cannot be broken by unconfirming
5. **Edge cases**: Test phones joining/leaving multiple groups, rapid movement, etc.

## Files to Modify

1. `src/imports/Desktop1.tsx`

- `updatePotentialGroups()` function
- `calculateProximityData()` function
- `handleConfirm()` function
- `handleUnconfirm()` function

2. `src/components/PhoneWithProximity.tsx`

- Verify unconfirm prevention logic
- Verify UI correctly shows/hides based on confirmed group status