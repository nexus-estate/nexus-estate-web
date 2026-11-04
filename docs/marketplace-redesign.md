# Marketplace redesign — implementation and verification

Implemented locally on 2026-11-03. No source was fetched from GitHub, no local work was reset, and nothing was deployed.

1. **References and scope**

   The paths `design-references/marketplace-home.png` and `marketplace-detail.png` were absent. Both corresponding approved images were found and inspected at `.agents/designe-referent/image.png` (Home) and `.agents/designe-referent/image copy.png` (Detail).

   Redesigned `/`, `/properties`, and `/properties/[id]`. The existing `/properties/estate/[id]` also receives the shared detail layout. Provider and Admin page layouts, API contracts, authentication, platform routing, and Docker configuration were not edited by this task.

2. **Files changed by this task**

   | Area                         | Files                                                                                                                               |
   | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
   | Marketplace layout and theme | `app/(main)/layout.tsx`, new `app/(main)/marketplace.css`                                                                           |
   | Browse and listing detail    | `app/(main)/properties/page.tsx`, `app/(main)/properties/[id]/page.tsx`                                                             |
   | Navigation                   | `components/Header.tsx`, `components/Footer.tsx`                                                                                    |
   | Homepage and shared cards    | `components/customer/marketplace-home.tsx`, `estate-card.tsx`, `property-card.tsx`                                                  |
   | Detail components            | `components/customer/property-detail/property-detail-layout.tsx`, `property-information.tsx`, `property-contact-card.tsx`           |
   | Gallery                      | `components/customer/property-gallery.tsx`, `components/shared/estate-gallery.tsx`, `components/customer/property-gallery.test.tsx` |
   | Visual primitives            | new `components/customer/marketplace-icon.tsx`; optional Marketplace variant in `components/portal/nexus-brand.tsx`                 |
   | Translations                 | `messages/en/customer.json`, `messages/vi/customer.json`                                                                            |
   | Verification                 | new `scripts/verify-marketplace.mjs`, this report                                                                                   |

   The checkout already had edits to `.env.example`, `README.md`, `docker-compose.yml`, `app/provider/properties/new/page.tsx`, Browse, and the customer translation files, plus untracked location hooks and `.agents/`. Those changes were retained. Browse continues to use the existing `useLocations` work; its prior dependent ward reset remains intact.

3. **Components created and reused**

   - Created a scoped Marketplace theme, SVG icon primitive, and a read-only browser verification script. No dependencies were added and global design tokens were not changed.
   - Reused `EstateImage`, `useEstateMedia`, `getEstateImages`, `PropertyGalleryImage`, and the existing native-dialog lightbox. Media stays tied to Estate identity and ascending `sortOrder`; the first sorted image remains the cover.
   - Consolidated cards through `EstateCard`; `PropertyCard` supplies the Listing URL without confusing Listing IDs with Estate IDs. The compact related-property variant uses the same component.
   - Reused `PropertyContactCard` and `leadApi.create`, including validation, loading, success and error handling. Enquiry submission remains available only with a Listing ID.
   - Reused authentication, language switching, platform URL helpers and location queries. The shared gallery and brand retain their default portal variants.

4. **Implemented behavior**

   - Home: architectural hero, sale/rental search tabs, compact capability highlights, four-column desktop card grid, truthful sponsored labels when promoted data exists, and working category/filter links.
   - Browse: compact heading, search, purpose/type/province/ward filters, removable filter chips, result count, client-side sorting, existing 12-item pagination, and loading/empty/error/retry states. Changing between sale and rental navigation refreshes the filter state.
   - Detail: gallery beside the price/contact sidebar on desktop; adaptive secondary image grid; preview arrows and lightbox; title/category/address; available facts; overview, description and location anchors; and real matching estates when available. Transient listing fetch errors now offer retry rather than always reporting not found.
   - Responsive navigation, wrapping facts and a normal-flow contact section on small screens. Fixed both mobile overflow and the sidebar's minimum-content overflow on laptop widths.

5. **Differences from the reference and API limitations**

   - The decorative hero uses the existing `public/images/hero-villa.webp`, a different photograph from the reference. Property cards and gallery use actual API media, never illustrative replacement photos.
   - At verification the public API returned three estates, one published listing and no promoted listings. Therefore Home displays three actual cards in its four-column desktop grid. The inspected listing has four images, so its secondary grid adapts to three thumbnails; five-preview and larger galleries are covered by unit tests.
   - No public provider display/contact profile, verification, response metrics, amenities, favourites, notifications or project-browsing contract is exposed in the inspected APIs. Those reference elements are omitted. The Provider navigation retains its existing portal destination.
   - The sidebar uses the existing enquiry form rather than inventing phone/chat contacts or a separate consultation service. An estate without a Listing ID retains the contact-unavailable state.
   - Location uses the actual address. A map link is available only when latitude and longitude exist; the inspected listing has neither.
   - Similar estates are selected from actual public estates by compatible purpose and matching type or province. They are not claimed to be a backend recommendation service.
   - The compact footer retains supported destinations and removes misleading placeholder service/legal links. Typography uses the existing system font stack. This is a visual adaptation, not a pixel-perfect reproduction.

6. **Visual verification**

   Captured and inspected real API-backed Home, Browse and Detail pages at 1440×900, 1280×800, 768×1024 and 390×844. Compared desktop composition, spacing, card ratio, typography, gallery/sidebar alignment and emerald styling with both reference images. Checked responsive reflow and corrected the observed overflow and image stacking issues.

   Artifacts are in `test-results/marketplace-redesign/`:

   - `home-{1440,1280,768,390}.png`
   - `browse-{1440,1280,768,390}.png`
   - `detail-{1440,1280,768,390}.png`
   - `gallery-lightbox.png`
   - `verification.json` with measurements, the actual listing ID, interaction results and page errors

   The browser script checks all twelve route/viewport combinations for horizontal overflow, uses real media and checks seven interaction groups: mobile navigation; hero search and sale/rental navigation; province/ward filters; empty/reset/sort behavior; cover order/lightbox/keyboard/focus; section anchors/enquiry expansion; and separate Provider URLs. No leads or other backend records are created by the script.

   Reproduce with the local Marketplace and API running:

   ```sh
   node scripts/verify-marketplace.mjs
   ```

   Override `MARKETPLACE_PREVIEW_URL`, `MARKETPLACE_API_URL` or `MARKETPLACE_QA_OUTPUT` when needed. The script requires at least one real published listing with media. Screenshots are ignored runtime artifacts; the script is retained in source.

7. **Checks**

   | Check                                                                                                 | Result                                                                |
   | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
   | `npm run lint`                                                                                        | Passed, no warnings                                                   |
   | `npm run type-check`                                                                                  | Passed                                                                |
   | `npm run i18n:check`                                                                                  | Passed, English/Vietnamese parity                                     |
   | `npm test -- --runInBand`                                                                             | 28 suites, 201 tests passed                                           |
   | `npm run build`                                                                                       | Passed, production webpack build                                      |
   | Existing Playwright Marketplace/i18n/platform-boundary/realm-isolation/customer-auth-return selection | 9 passed; 2 skipped because they require multi-platform mode          |
   | Real-data browser verification                                                                        | 12 responsive captures, 7 interaction groups, no uncaught page errors |
   | `git diff --check`                                                                                    | Passed                                                                |

8. **Remaining verification limits**

   No live enquiry was submitted. Pagination beyond twelve real estates cannot be exercised with the current three-record dataset. Provider and Admin were not visually redesigned or exhaustively browser-tested; default gallery compatibility and existing platform/auth tests passed. Missing backend features listed above remain intentionally absent. No known blocking Marketplace issue remains from the completed checks.
