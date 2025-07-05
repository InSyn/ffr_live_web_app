# FFR Live Platform: Official Styling Guide

**Version:** 2.0
**Status:** Active Reference
**Purpose:** This document outlines the principles and architecture of the FFR Live styling system.

---

## **1. Guiding Philosophy**

Our styling is built on a **Hybrid Architecture** designed for scalability, consistency, and developer efficiency. It combines three core concepts:

1. **Design Tokens (The Single Source of Truth):** All fundamental values (colors, spacing, fonts, radii) are defined as CSS Custom Properties in `abstracts/_variables.scss`. This ensures consistency and simplifies theme management.

2. **Utility Classes (The Tools):** A comprehensive set of utility classes are generated from our design tokens via SCSS loops in `abstracts/_utilities.scss`. These handle common styling needs directly in Vue templates, speeding up development.

3. **Scoped Component Styles (The Last Mile):** For styles that are truly unique to a single component, we use `<style lang="scss" scoped>`. This is our tool for handling complex or component-specific CSS without polluting the global scope.

### **2. System Architecture**

All global styles are managed within `frontend/src/assets/styles/` and imported into the application via a single entry point: `main.scss`.

The directory is organized as follows:

- **`main.scss`**: The single entry point that imports all other style partials in the correct order.
- **`abstracts/`**: Contains the "thinking" parts of our system. It does not output any CSS directly.
  - `_variables.scss`: Defines all CSS Custom Properties (design tokens) for colors, spacing, typography, etc.
  - `_mixins.scss`: Home to our powerful SASS mixins, such as `respond-to` for media queries and `fluid-type` for responsive typography.
  - `_utilities.scss`: Contains the SCSS loops that generate our utility class system.
  - `_animations.scss`: Keyframe animations.
- **`base/`**: Defines the standard styles for common HTML elements.
  - `_reset.scss`: Normalizes browser default styles.
  - `_typography.scss`: Sets the base font styles for elements like `body`, `h1`, `p`, etc.
  - `_overrides.scss`: Global style overrides for third-party libraries (like Vuetify) or base element styles.

### **3. Developer Checklist for Components**

When building or refactoring components, adhere to the following checklist to ensure consistency:

- **✅ Tokenization Check:**
  - **NO** hardcoded `px` or `rem` values for spacing. **USE** `var(--space-*)` tokens.
  - **NO** hardcoded `font-size` or `font-weight`. **USE** `var(--font-*)` tokens or the `fluid-type` mixin.
  - **NO** hardcoded colors. **USE** semantic color tokens (e.g., `var(--color-text-primary)`).
  - **NO** hardcoded `border-radius`. **USE** `var(--radius-*)` tokens.
  - **NO** hardcoded `@media` queries. **USE** the `@include respond-to()` mixin.

- **✅ Utility Class Check:**
  - Have repetitive layout styles (Flexbox, Grid, margins) been replaced with utility classes?
  - Is the final `<style>` block minimal, containing only truly unique or complex selectors?

- **✅ Defensive Styling Check:**
  - Is the layout resilient to changes in text length (using `text-overflow`, `flex-wrap`, etc.)?
  - Does the layout handle missing or empty data gracefully?
  - Do images and media handle various aspect ratios without distortion (using `object-fit`)?
