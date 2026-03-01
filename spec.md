# Specification

## Summary
**Goal:** Update the URLs for the mAadhaar and Xiaomi Home entries in the sidebar's default links data file.

**Planned changes:**
- Update the mAadhaar entry URL in the SERVICES category of `frontend/src/data/defaultLinks.ts` to `https://uidai.gov.in/en/`
- Update the Xiaomi Home entry URL in the SERVICES category of `frontend/src/data/defaultLinks.ts` to `http://play.google.com/store/apps/details?id=com.xiaomi.smarthome&hl=en_IN`

**User-visible outcome:** Clicking the mAadhaar sidebar link opens the UIDAI website, and clicking the Xiaomi Home sidebar link opens its Google Play Store page, both in a new tab.
