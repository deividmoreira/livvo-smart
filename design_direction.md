# Design Direction: Modern Urban Luxury

## 1. Design Direction Summary

*   **Aesthetic Name:** Editorial Luxury (Modern Urban)
*   **DFII Score:** 12 (High Impact, High Fit, Moderate complexity)
    *   *Impact (4):* Playfair Display + Dark Navy/Bronze is instantly recognizable vs standard Blue/System SaaS.
    *   *Fit (5):* Perfect for high-value real estate. Trust + Exclusivity.
    *   *Feasibility (4):* Standard Expo Fonts + Colors. Glassmorphism already active.
    *   *Performance (4):* CSS-based styles, lightweight fonts.
    *   *Consistency Risk (-5):* Low, using strict constants.
*   **Key Inspiration:** Luxury architectural magazines (Architectural Digest), High-end hotel booking apps (Tablet Hotels), Minimalist fin-tech (Wealthfront).

## 2. Design System Snapshot

### Typography
*   **Headings:** `Playfair Display` (Serif). Used for Price, Property Titles. Evokes elegance, tradition, and premium quality.
*   **Body:** `Manrope` (Sans-serif). Modern, geometric, highly readable. Used for all details, amenities, buttons.

### Color Palette
*   **Dominant (Primary):** `Slate 900 (#0F172A)`. Deep navy/black. Replaces generic "Tech Blue". Serves as the anchor for trust and sophistication.
*   **Accent:** `Bronze/Amber 700 (#B45309)`. Used for "Call to Action", prices, and highlights. Warmth against the cool dark slate.
*   **Background:** `Crisp Off-White (#FAFAFA)`. Avoids clinical white.

### Spacing & Layout
*   **Rhythm:** Multiples of 4px.
*   **Cards:** High border radius (20px - `xl`), deep soft shadows (`shadowOpacity: 0.12`).

### Motion Philosophy
*   **Ease-Out:** All interactions use a "decelerate" curve (t * (2-t)) for a weighted, premium feel.
*   **Staggered:** List items fade in with a 60ms delay.

## 3. Differentiation Callout
> "This interface avoids generic 'Real Estate Blue' UI by adopting a **Editorial Luxury** stance. Instead of looking like a utility tool, it looks like a lifestyle magazine. We use **Serif Headings** and **Deep Navy/Bronze** tones to signal exclusivity, differentiating Livvo Smart from competitors like Zillow or Zap Imóveis which rely on utilitarian high-saturation blues."
