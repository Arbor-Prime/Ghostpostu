GHOSTPOST APP COMPLETE REBRAND — DESIGN BRIEF FOR ALL SCREENS

Design a complete set of application screens for GhostPost, an AI-powered social media outreach tool. There are 14 screens total plus a sidebar navigation and header bar. Every screen must follow the same design language described below. Design each screen as a desktop web app layout at 1440x900 resolution.

DESIGN REFERENCES:
Primary: The GhostPost marketing site at https://ghostpost-marketing-website-design.vercel.app/
Secondary: Manus AI at https://manus.im
The app should feel like the natural next step after visiting the marketing site.

DESIGN LANGUAGE:

The overall aesthetic is clean, light, editorially restrained, and quietly premium. Think Linear, Notion, and Manus — not Dribbble, not dashboard templates, not startup-generic.

THEME: Light only. White backgrounds everywhere. No dark mode. No glassmorphism. No frosted glass. No blur effects. No gradients on backgrounds. No glow effects. No complex shadows.

FONT: Figtree from Google Fonts is the ONLY typeface. No monospace fonts. No serif fonts. No secondary typefaces. Use weight 400 for body text, 500 for labels and metadata, 600 for sub-headings and buttons, 700 for section titles and card headings, 800 for page titles. Tighten letter-spacing slightly on headings.

COLOURS:
Page background: Very light warm grey, almost white (like Notion's background)
Cards and panels: Pure white
Inset surfaces and input fields: Very light grey (slightly darker than the page background)
Borders: Light grey, barely visible, structural only
Primary text: Near-black, warm
Secondary text: Medium grey
Dim text: Light grey for timestamps and metadata
Primary accent: Warm gold (the same gold from the GhostPost logo on the marketing site) — used SPARINGLY for the logo mark, active navigation states, primary call-to-action buttons, and slider fills. Nothing else.
Links and interactive elements: Standard blue
Success states: Green
Error states: Red
Warning states: Amber

ICONS: Monochrome only. Use Lucide-style thin stroke icons throughout. Every icon is a single colour (medium grey by default, dark grey on hover, gold when active in navigation). No coloured icons. No filled icons. No emoji as icons. No Font Awesome. Think of the icon style you see in Linear or Raycast — minimal, consistent stroke weight, single colour.

SHADOWS: Extremely minimal. Cards have a barely-perceptible shadow — just enough to lift them off the page background. No multi-layer shadows. No coloured shadows. No inset shadows.

BORDER RADIUS: 12px on cards and panels. 8px on buttons and inputs. 20px on pills and badges. Clean and consistent.

LOGO: A small rounded square (about 24x24 pixels) filled with a warm gold gradient, containing a bold white capital letter G. This appears in the top-left of the sidebar next to the word "GhostPost" in bold.

BUTTONS: Primary buttons have a gold background with white text. Secondary buttons have a white background with a light grey border and dark text. Destructive buttons have a red-tinted border with red text. All buttons use Figtree 600 weight, 8px border radius.

INPUT FIELDS: Light grey background, light grey border, 8px border radius. On focus, the border changes to gold. Placeholder text in light grey.

LAYOUT: The app has a fixed 220px wide left sidebar (white, with a right border) containing the logo, navigation items, and a system status indicator at the bottom. To the right of the sidebar is a 56px tall header bar (white, with a bottom border) showing the page title on the left and status indicators on the right. Below the header is the main content area with the page background colour.

SIDEBAR NAVIGATION: Each nav item is a horizontal row with a monochrome stroke icon on the left and a text label on the right. The default state uses medium grey icon and secondary grey text. The hover state adds a very light background tint. The active state uses a gold-tinted background, gold icon colour, dark text, and a thin gold left border accent. The sidebar has these items: Dashboard, Browser View, Approvals (with a small gold pill badge showing pending count), Tracked Profiles, Personas, AI Composition, Simulation, Settings.


NOW DESIGN THESE 14 SCREENS:


SCREEN 1: WELCOME (Onboarding — no sidebar)

Full-page centred layout on the light page background. No sidebar or header.
Top: The GhostPost logo mark (gold square with G) and "GhostPost" text.
Main heading: "Before we set anything up, I need to get to know you." — large Figtree 800 weight. The phrase "get to know you" is in gold.
Below the heading: A short paragraph explaining GhostPost needs a voice recording.
Below that: Three clean white cards in a vertical stack, each with a monochrome icon, a title, and a one-line description. The three cards explain: "What you do", "What you care about", "How you communicate".
At the bottom: A gold primary button reading "Let's begin".
No background decorations, no glows, no gradients. Just typography and white cards on a light background.


SCREEN 2: RECORDING (Onboarding — no sidebar)

Centred layout. A large circle in the centre of the page with a microphone icon inside. The circle has a thin light grey border normally, and a gold pulsing border ring when actively recording.
Above the circle: A rotating prompt in secondary grey text, e.g. "Tell me about yourself..."
Below the circle: A timer showing elapsed recording time in large bold text (e.g. "1:42").
Below the timer: Control buttons — a gold record/stop button, a pause button (outlined), and a "Done" button that appears after sufficient recording time.
Minimalist. The circle and timer are the focal point.


SCREEN 3: PROCESSING (Onboarding — no sidebar)

Centred layout. A vertical list of 6 processing steps, each appearing one at a time.
Each step is a row: a small circle icon on the left (grey when pending, gold when active with a subtle pulse, green checkmark when complete) and step text on the right.
Steps: "Transcribing your voice", "Analysing vocabulary and patterns", "Identifying topics and interests", "Mapping communication style", "Reading emotional range", "Building your voice profile".
Below the steps: A thin horizontal progress bar with a gold fill that advances from left to right.
Clean, simple, no heavy styling.


SCREEN 4: VOICE PROFILE (Onboarding — no sidebar)

This screen shows the user's extracted voice profile for review and adjustment.
Layout: Centred content area, maximum width about 700px.
Sections from top to bottom:

A. Summary quote — a short AI-generated description of how the user communicates, displayed in a white card with a thin gold left border accent.

B. Style sliders — three horizontal sliders: Formal to Casual, Reserved to Expressive, Cautious to Direct. Slider tracks are light grey, the filled portion and thumb are gold.

C. Topics — a cluster of rounded pill-shaped tags showing detected topics. Larger pills for primary topics, smaller for secondary. Light grey background with dark text.

D. Signature words — a row of pill tags with gold-tinted backgrounds and gold text showing words the user uses frequently (e.g. "honestly", "mate", "ship it").

E. Anti-words — a row of pill tags with red-tinted backgrounds and red text showing words the user never uses (e.g. "synergy", "leverage").

F. Emotional range — horizontal bar indicators for: Humour, Passion, Sarcasm, Supportive, Vulnerability. Each bar fills from left (low) to right (high) in gold against a light grey track.

G. Format preferences — a small table showing line breaks, emoji usage, sentence length, hashtags, swearing, caps usage.

H. Off-limits topics — a list of topics the user has marked as do-not-discuss.

At the bottom: A gold primary button "Confirm and continue" and a secondary outlined button "Adjust manually".


SCREEN 5: PERSONA SCHEDULE (Onboarding — no sidebar)

Shows 8 time-window personas mapped across a 24-hour timeline.
Top: A horizontal timeline bar spanning the full width, divided into 8 colour-coded blocks. The colours are MUTED PASTELS (soft pink, soft blue, soft green, soft amber, soft purple, soft grey, soft orange, soft red — all at low opacity so they look like tinted white, not saturated blocks).
Below the timeline: 8 persona cards arranged in a 2-column grid. Each card is white with a 1px border. Contains: persona name in bold (e.g. "Evening Wind-Down"), time range in dim text (e.g. "19:30 – 21:00"), a short description, energy level as a thin gold bar, and tone keywords.
Below the cards: Quick-adjust buttons (outlined) for common patterns like "I work 9-5", "I'm a night owl", "I don't have kids".
At the bottom: A gold "Generate schedule" button.


SCREEN 6: X AUTH (Onboarding — no sidebar)

Centred layout for connecting an X (Twitter) account.
A monochrome "X" logo (just the letter X in a circle, not the Twitter bird, not coloured).
Heading: "Connect your X account"
Two input fields for auth_token and ct0 cookie values. Light grey backgrounds, light grey borders, gold focus borders.
Below: A gold "Connect" button.
Status area: Shows "Connected" with a green dot and username when successful, or "Expired" with an amber dot when the session has lapsed.
An info card explaining how to extract cookies from the browser, with a monochrome info icon.


SCREEN 7: DASHBOARD (Main app — with sidebar and header)

The main dashboard after onboarding. Shows an overview of system activity.

Top row: 4 stat cards in a horizontal row. Each card is white with a 1px border. Large bold number, small dim label underneath. Cards show: Tweets Scanned, Opportunities Found, Drafts Pending, Replies Posted.

Below: A two-column layout.

Left column (wider): An area chart showing activity over the past 7 days. Gold fill for the primary metric, blue line for secondary. White background, light grey gridlines. Title "Activity" in bold above.

Right column (narrower):
A. Current persona indicator — small white card showing the active persona name, monochrome icon, mood, and energy level.
B. Recent activity feed — a vertical list of recent events. Each event is a row with a small monochrome icon, a description in regular text, and a timestamp in dim text aligned right. Events like "Scanned @elonmusk", "Draft generated for opportunity 47", "Reply posted to @paulg".

Bottom: A "Live Events" section showing real-time socket events as they arrive. Minimal styling — just text rows with timestamps.


SCREEN 8: BROWSER VIEW (Main app — with sidebar and header, but NO header on this page)

This is the most important screen. It is the Manus-style two-panel layout from the marketing site demo.

The full area (minus sidebar) is split into two panels:

Left panel (about 35% width): White background with a right border.
Top: A sub-header with the campaign name (e.g. "Outreach: Dojo Cards — Nottingham Restaurants") in bold.
Below: A scrolling action log. Each entry is a row with a small circle icon (16px, light grey background, monochrome symbol inside) and text. Some entries are status/progress lines without icons. The log shows actions like: "Editing file todos.md", "Browsing instagram.com/nottingham_bites/", "Scrolling down", "Viewing the page", "Creating file leads/nottingham_bites.md", "Typing personalised message...", "DM sent to @nottingham_bites" (this one has a green-tinted icon with a checkmark). At the bottom of the log, a blue pulsing dot with "Thinking" text.
Bottom of left panel: An input field with a paperclip icon and placeholder "Message GhostPost".

Right panel (65% width): Light grey background.
Top: A header showing the gold G logo mark, "GhostPost's Computer" text, a status line like "GhostPost is using Browser", and a "Take Control" outlined button.
Below the header: A browser chrome bar with back/forward/reload nav buttons (small rounded squares with monochrome arrows), and a URL field showing the current page address.
Main area: The browser viewport showing a realistic Instagram interface — a profile page or DM conversation.
Bottom: A status bar spanning both panels with a thin progress bar (gold fill), a blue pulsing dot with "GhostPost is working: DMing restaurants in Nottingham", a page counter like "2 / 5", and a small green "live" badge.


SCREEN 9: APPROVALS (Main app — with sidebar and header)

A list of AI-generated draft replies awaiting human approval.
Each draft is a white card with a 1px border containing:
Top section: The original tweet — grey circle avatar, author handle in dim text, tweet content in primary text, engagement stats (likes, replies) in dim text.
Middle section: The generated reply text in slightly bolder weight. Below it: metadata showing response type (e.g. "standard"), word count, circadian mood, energy level — all in small dim text.
Bottom section: Action buttons in a row — Approve (outlined green), Reject (outlined red), Edit (outlined grey), Regenerate (outlined gold). Each button has a monochrome icon and label.

Status filter at top: Pills for "All", "Pending" (gold), "Approved" (green), "Rejected" (red). Active pill is filled, others are outlined.

Cards are arranged in a single-column vertical list with comfortable spacing.


SCREEN 10: TRACKED PROFILES (Main app — with sidebar and header)

A grid of profile cards for accounts being monitored.
Top: An "Add Profile" button (outlined, with a plus icon) and a search input.
Cards arranged in a 3-column grid. Each card is white with a 1px border containing: Profile handle in bold (e.g. "@elonmusk"), platform icon (monochrome), tweets scanned count, opportunities found count, last scanned timestamp in dim text, priority indicator (gold dot for high priority, grey dot for normal), and a "Scan Now" button (small gold button with play icon).

Each card also has a small kebab menu (three dots) for remove/edit options.


SCREEN 11: PERSONAS (Main app — with sidebar and header)

Shows the user's circadian persona system.
Top: A 24-hour horizontal timeline bar with muted pastel blocks showing when each persona is active.
Below: Persona detail cards in a vertical list. Each card is white with a 1px border. Contains: Persona name in bold, time range in dim text, monochrome icon, description text in secondary grey, energy level as a thin horizontal gold bar, tone keywords as small pills.
The currently active persona card has a thin gold left border accent and a small "Active now" badge.


SCREEN 12: AI COMPOSITION (Main app — with sidebar and header)

Content generation and analysis tools.
Top section: Content theme breakdown — horizontal bars showing topic distribution (e.g. "AI and Machine Learning 40%", "Dev Tools 30%"). Bars fill with gold (primary) and blue (secondary).
Middle section: A heatmap grid showing posting activity by day and time block. Cells range from very light (low activity) to gold (high activity). Days on the y-axis, time blocks on the x-axis.
Bottom section: Draft generation controls — dropdowns and inputs for selecting tracked profiles, response types, and generating new drafts. A gold "Generate Draft" button.


SCREEN 13: SIMULATION (Main app — with sidebar and header)

Currently a placeholder screen.
Centred white card with a monochrome flask icon, heading "Simulation Not Yet Active", description text explaining the feature will benchmark persona believability against real human patterns.
Below: Three greyed-out score ring placeholders labelled "Behaviour Score", "Timing Score", "Content Score" — each is a simple circle outline with a dash instead of a number.
An info note explaining the feature requires 7+ days of activity and 50+ observations.


SCREEN 14: SETTINGS (Main app — with sidebar and header)

A settings page with a left category list and right content area.
Left column (about 200px): A vertical list of setting categories grouped under headings: Account (General, Notifications), AI Configuration (Voice Profile, Personas, Privacy and Data), System (Integrations, System Health, Billing). Active category has gold left border and gold-tinted background.
Right column: The settings content for the selected category. Contains form fields (text inputs, toggles, dropdowns) with light grey backgrounds and gold focus borders.
For System Health: A list of service status rows — each showing a service name (Database, Redis, Ollama, Playwright), a green or red status dot, and "Running" or "Down" text.
For Voice Profile: A summary of the voice profile with an "Edit" button and a danger zone with a red "Reset Voice Profile" button.


DESIGN EVERY SCREEN LISTED ABOVE. Each screen must feel like part of the same product — consistent typography, consistent spacing, consistent card styles, consistent icon treatment, consistent use of gold accent. The product should feel like Manus or Linear — clean, confident, quiet, premium.