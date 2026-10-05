# Unfold Jesus

Build a production-ready, mobile-first React + TypeScript web application called Unfold Jesus.

PRODUCT VISION

Unfold Jesus is a Christian platform for people who have questions, doubts, confusing Bible passages, and thoughts about Christianity.

The core philosophy is:

No question is too difficult to ask.

Ask the question. Open Scripture. Understand it.

The platform should be welcoming to:

Christians


New believers


People questioning their faith


People who are curious about Christianity


People who are not Christians but want to understand Jesus


Do not make the UI feel judgmental, aggressive, or overly religious in a way that discourages questions.

The tone should be:

Warm


Respectful


Intelligent


Curious


Modern


Youth-friendly


Biblically grounded


Easy to understand


The platform should NOT present itself as replacing churches, pastors, theologians, or personal Bible study.



BRAND

Name:

Unfold Jesus

Tagline:

Questions about Jesus. Answers from Scripture. Explained simply.

Alternative supporting phrase:

No question is too difficult to ask.

Use a clean, premium, modern Christian visual identity.

Avoid stereotypical church website design.

Do not overuse crosses, doves, glowing Jesus images, or stock religious imagery.

Use elegant typography, generous whitespace, subtle warm colors, and accessible contrast.

Primary visual feeling:

Modern + trustworthy + peaceful + thoughtful.



TECHNOLOGY

Use:

React


TypeScript


Vite


Tailwind CSS


shadcn/ui where appropriate


Supabase


Supabase Auth


Supabase PostgreSQL


Supabase Storage


Supabase Row Level Security


React Router


TanStack Query where useful


Zod for validation


React Hook Form where useful


Payments:

Paystack


Do not hardcode secrets.

Use environment variables.

Example:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_PAYSTACK_PUBLIC_KEY

Never expose Supabase service-role keys or Paystack secret keys in frontend code.



DATABASE ARCHITECTURE

Supabase PostgreSQL is the production source of truth.

Do NOT create a second production database using SQLite.

SQLite may be used only for:

local development utilities


local caching


offline functionality if needed


localStorage may be used for:

UI preferences


theme preference


temporary drafts


recently viewed content


anonymous browsing preferences


Do not store sensitive authentication information in localStorage.

Supabase Auth is the authentication source of truth.



MIGRATIONS

This is extremely important.

Create all database changes as versioned SQL migration files under:

/supabase/migrations/

Do not rely on manually creating tables in the Supabase dashboard.

Generate migrations that can be copied into and executed against a completely separate/custom Supabase project.

Use standard Supabase/PostgreSQL SQL.

Example:

/supabase/migrations/
0001_initial_schema.sql
0002_profiles.sql
0003_posts.sql
0004_comments.sql
0005_storage.sql
0006_rls.sql
0007_donations.sql
...

Include:

tables


indexes


foreign keys


constraints


triggers


functions


RLS policies


storage policies


updated_at triggers


useful database functions


Make migrations idempotent where practical.

Also create a README explaining:

How to create a Supabase project


How to connect the local project


How to apply migrations


How to configure environment variables


How to create Supabase Storage buckets


How to configure Paystack


How to run locally


How to deploy


Do not assume the developer will use Bolt's Supabase project.

The application must be portable to another Supabase project by changing environment variables and applying the migrations.



AUTHENTICATION

Use Supabase Auth.

Support:

Email/password registration


Email/password login


Logout


Password reset


Email verification


Google OAuth if configuration is available


Guest browsing


Registered users can participate.

Unregistered users can read public content.

Unauthenticated users cannot:

Create posts


Comment


React


Bookmark


Follow users


Create prayer requests


Donate using saved account information


Do not unnecessarily prevent unauthenticated users from reading content.



USER PROFILE

Create profiles associated with Supabase Auth users.

Profile fields:

id


username


display_name


avatar_url


bio


country


created_at


updated_at


Allow users to:

Edit profile


Upload avatar


Change display name


Change username


Change bio


Change country


Delete account


Username must be unique.

Profiles should have privacy-aware design.

Do not expose email addresses publicly.



POSTS

Posts are the heart of the platform.

Support post types:

question


doubt


thought


bible_passage


testimony


Each post should support:

id


author_id


type


title


content


category_id


anonymous


created_at


updated_at


view_count


status


Status values can include:

published


hidden


deleted


pending_review


Allow image attachments.

Allow multiple images per post.

Posts should have:

comments


replies


reactions


bookmarks


reports


views




ANONYMOUS QUESTIONS

Allow registered users to optionally post anonymously.

If anonymous is true:

Do not display the author's identity publicly.


Do not expose their profile information through the UI.


Admins may still be able to identify the author when necessary for moderation.


Show:

Anonymous

instead of the user's name.



IMAGE UPLOADS

Use Supabase Storage.

Create appropriate buckets for:

avatars


post-images


story-images


Validate:

file type


file size


image dimensions where appropriate


Allow:

JPG


JPEG


PNG


WebP


Do not allow arbitrary executable files.

Generate image previews.

Allow users to remove their uploaded images.

Storage policies must prevent unauthorized modification/deletion of other users' files.



CATEGORIES

Create categories such as:

Jesus


God


Holy Spirit


Bible


Prayer


Salvation


Sin


Faith


Doubt


Relationships


Purpose


Suffering


Death and Eternity


Christianity and Science


Christianity and Culture


Church


Difficult Bible Passages


Categories should be database-driven and manageable by admins.



BIBLE REFERENCES

Posts should allow Bible references.

Example:

John 10:30
Luke 22:42
John 1:1
John 20:28

Create a bible_references table or appropriate normalized structure.

Allow a post to contain multiple Bible references.

Display Bible references as clickable items.

Example:

John 10:30

Clicking it should open a Bible passage viewer.

IMPORTANT:

Do not scrape copyrighted Bible translations.

Structure the application so Bible translations can be added through a licensed/public-domain source later.

For the initial version, support:

Bible book


chapter


verse


reference


optional passage text


Use public-domain Bible text only if actual text is included.

Clearly separate Scripture text from explanations/commentary.



"EXPLAIN IT SIMPLY"

This is a core feature.

Every featured Bible question should have a structured explanation:

What the Bible says

Relevant Scripture.

In simple terms

Plain-language explanation.

Why people get confused

Explain the apparent contradiction or difficult concept.

What Christians generally believe

Explain the mainstream Christian understanding.

Where Christians disagree

When genuine theological disagreement exists, explain the major interpretations fairly.

Do not falsely present disputed interpretations as unquestionable facts.

This section can initially be manually created by admins.

Design the database so AI-generated explanations can be added later.



COMMUNITY FEED

Create:

For You


Latest


Questions


Doubts


Popular


Unanswered


For the initial release, "For You" can be a simple popularity/recentness algorithm.

Do not build an unnecessarily complicated recommendation system.

Cards should show:

title


excerpt


category


author


anonymous status


date


reactions


comments


views


attached images


Bible references




COMMENTS

Registered users can:

Comment


Reply to comments


Edit their comments


Delete their comments


Report comments


Support nested replies.

Prevent unlimited nesting; use a reasonable depth such as 2–3 levels.

Use optimistic UI where appropriate.



REACTIONS

Support a simple reaction system.

Initial reactions:

❤️
🙏
🤔

Users can toggle reactions.

Prevent duplicate reactions per user/post.



BOOKMARKS

Registered users can save posts.

Create:

Saved

page.

Allow:

Save


Unsave


View saved posts




FOLLOWING

Allow users to follow other users.

Profile pages should show:

Display name


Username


Avatar


Bio


Country


Post count


Followers


Following


Do not expose private information.



SEARCH

Global search should search:

Posts


Questions


Bible references


Categories


Users


Stories


Create a dedicated search page.

Support:

keyword search


filters


categories


post type


Make search mobile friendly.



UNANSWERED QUESTIONS

Create a dedicated section:

Unanswered Questions

Show questions with no meaningful answers.

This should encourage knowledgeable users to participate.



DAILY QUESTION

Create an admin-managed Daily Question.

Homepage should have:

Today's Question

Example:

If Jesus is God, why did He pray to God?

Allow:

discussion


Bible references


explanation


sharing


Create database support for daily questions.



DAILY VERSE

Create an admin-managed Verse of the Day.

Show:

reference


verse text


short explanation


share button


Allow sharing as an attractive social card.



PRAYER WALL

Create a Prayer section.

Registered users can post prayer requests.

Fields:

title


content


anonymous


category


created_at


Other users can click:

I'm praying 🙏

Display a prayer count.

Allow comments/support.

Users should be able to delete their own requests.

Allow anonymous prayer requests.



STORIES / TESTIMONIES

Create:

Stories

Users can submit:

testimony


faith journey


life story


experience


Support:

text


images


anonymous posting


Stories can be:

published


pending


hidden


Admins can feature stories.



DONATIONS

Create a professional donation section.

Purpose:

Support vulnerable people such as:

Orphans


Widows


Elderly people with disabilities


Food assistance


Education


Medical assistance


Emergency support


Do NOT make unsupported claims about beneficiaries.

Create donation categories/projects.

Examples:

General Fund


Orphan Support


Widow Support


Elderly Support


Education


Medical Support


Support:

One-time donations


Monthly donations where supported


Anonymous donations


Registered-user donations


Payment provider:

Paystack

Implement Paystack securely.

IMPORTANT:

Payment verification must happen server-side.

Never trust a frontend payment-success response.

Create a secure backend/server-side verification flow.

Store:

donation id


user id nullable


project id


amount


currency


status


paystack reference


donor name if provided


anonymous flag


created_at


verified_at


Possible statuses:

pending


successful


failed


refunded


Do not store card numbers, CVV, PINs, or other sensitive card data.



DONATION TRANSPARENCY

Create:

Transparency

Show publicly:

Total funds received


Funds distributed


Number of projects


Beneficiaries served


Current projects


Completed projects


Create a projects table.

Projects should support:

name


description


target amount


amount raised


status


start date


end date


featured image


updates


Admins can create project updates.

Do not expose vulnerable people's personal data.



ADMIN DASHBOARD

Create a complete admin dashboard.

Admin features:

Dashboard

Show:

total users


active users


total posts


questions


doubts


comments


reports


donations


successful donations


donation totals


active projects


Users

Admin can:

search users


view user


suspend


unsuspend


ban


verify contributor


change roles


Content

Admin can:

view posts


edit


delete


hide


publish


feature


pin


Reports

Show:

reported post


reported comment


reporter


reason


status


admin notes


Statuses:

pending


reviewed


dismissed


action_taken


Categories

Create/edit/delete categories.

Daily Question

Manage Daily Questions.

Daily Verse

Manage Verse of the Day.

Stories

Approve/reject/feature stories.

Prayer

Moderate prayer requests.

Donations

View:

transactions


status


project


amount


date


reference


Projects

Create/manage donation projects.

Transparency

Manage financial/project updates.



ROLES

Create a secure role system.

Roles:

user


contributor


moderator


admin


super_admin


Use database-backed roles.

Do NOT trust frontend role values.

Enforce permissions using Supabase RLS and secure server-side checks.



VERIFIED CONTRIBUTORS

Allow admins to mark certain accounts as:

Verified Contributor

Examples may include:

pastors


Bible teachers


theologians


Christian authors


apologists


The verification badge should only mean the identity/role has been reviewed by the platform.

It should NOT mean:

everything they say is automatically correct


they speak for all Christianity


their interpretation is official




REPORTING & SAFETY

Every post and comment should have:

Report

Reasons:

Spam


Harassment


Hate


Sexual content


Scam


False/misleading information


Copyright issue


Other


Users can block other users.

Implement reasonable rate limits.

Do not allow:

spam flooding


malicious file uploads


executable uploads


abusive content


Create clear Community Guidelines.



CONTENT PRINCIPLES

The platform is Christian-focused but should encourage honest questions.

A user should be able to say:

"I don't believe Jesus is God."

without automatically being banned.

The platform should distinguish:

questions


disagreement


harassment


Do not design the moderation system to punish honest theological disagreement.



HOME PAGE

Create a beautiful modern homepage.

Sections:

Hero


Headline:

Have questions about Jesus?

Subheadline:

Ask the difficult questions. Open Scripture. Understand it simply.

Buttons:

Explore Questions

Ask a Question

Today's Question


Trending Questions


Latest Questions


Bible Explained


Stories


Prayer Wall


Give & Help


Call to action


No question is too difficult to ask.



NAVIGATION

Desktop navigation:

Home


Explore


Questions


Bible


Stories


Prayer


Donate


Authenticated user:

Notifications


Saved


Profile


Mobile:

Use a bottom navigation bar for the most important sections.

Example:

Home | Explore | Ask | Prayer | Profile

Use a floating or prominent Ask button where appropriate.



RESPONSIVE DESIGN

Mobile-first.

Must work beautifully on:

small phones


large phones


tablets


laptops


desktops


TikTok traffic will primarily be mobile.

Make the mobile experience excellent.



SEO

Every public question should have a unique SEO-friendly URL.

Example:

/questions/if-jesus-is-god-why-did-he-pray

Generate:

title


meta description


Open Graph title


Open Graph description


canonical URL


Make public questions indexable.

Private user information must never be indexed.

Generate structured metadata where appropriate.

Create sitemap support.

Create robots.txt.



SOCIAL SHARING

Posts should have:

Copy link


WhatsApp


Facebook


X


Telegram


Create social preview metadata.

Design attractive share cards.



NOTIFICATIONS

Registered users should receive notifications for:

Someone answered your question


Someone commented


Someone replied


Someone reacted


Someone followed you


Someone mentioned you


Prayer support


Create notifications table.

Allow marking notifications read/unread.



SETTINGS

Create settings page.

Sections:

Account

email


password


username


Profile

name


bio


avatar


country


Privacy

profile visibility


anonymous posting preference


Notifications

email notifications


in-app notifications


Danger zone

delete account




ACCESSIBILITY

Follow accessible design principles.

Use:

semantic HTML


keyboard navigation


proper labels


ARIA where necessary


visible focus states


sufficient color contrast


alt text for images


Do not rely only on color to communicate state.



ERROR HANDLING

Create proper loading states.

Create:

skeleton loaders


empty states


error states


retry buttons


Never show raw database errors to users.

Log technical errors safely.



SECURITY

Security is a priority.

Implement:

Supabase RLS


input validation


file validation


authorization


rate limiting where appropriate


safe HTML rendering


XSS protection


secure Paystack verification


Never trust:

client-side roles


client-side payment status


client-provided ownership IDs


Never expose:

Supabase service role key


Paystack secret key


private user information




DATABASE TABLES

Create an appropriate relational schema including at minimum:

profiles
roles
user_roles
categories
posts
post_images
post_bible_references
comments
reactions
bookmarks
follows
reports
notifications
prayer_requests
prayer_support
stories
daily_questions
daily_verses
bible_books
bible_references
donation_projects
donations
project_updates

Add:

created_at


updated_at
where appropriate.


Use UUIDs for public-facing identifiers where appropriate.

Use foreign keys and indexes.

Add appropriate unique constraints.



RLS

Implement proper Row Level Security.

Examples:

Public users:

can read published public posts


can read published stories


can read public prayer requests


can read profiles that are public


Authenticated users:

can create posts


can edit/delete their own posts


can comment


can react


can bookmark


can follow


can create prayer requests


can edit/delete their own content


Admins:

can moderate content


can manage categories


can manage daily content


can manage donation projects


can view moderation information


Never allow users to bypass permissions through direct Supabase requests.



PROJECT STRUCTURE

Use a clean maintainable structure.

Example:

src/
components/
pages/
layouts/
hooks/
lib/
services/
types/
utils/
features/
auth/
posts/
comments/
bible/
prayer/
stories/
donations/
admin/

supabase/
migrations/

Keep business logic out of large UI components.

Create reusable components.



API / SERVICE LAYER

Create clean service modules for:

auth


profiles


posts


comments


reactions


bookmarks


Bible references


prayer


stories


donations


notifications


admin


Do not scatter raw Supabase queries throughout every component.



ENVIRONMENT CONFIGURATION

Create:

.env.example

Include placeholders:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYSTACK_PUBLIC_KEY=

Document server-only variables separately.

Never commit real credentials.



LOCAL DEVELOPMENT

Provide instructions for:

npm install
npm run dev

Include Supabase local development instructions if useful.

Support a developer connecting their own Supabase project.



SEED DATA

Create a seed SQL file or migration with development/demo content.

Include:

categories


sample questions


sample Bible references


daily question


daily verse


sample stories


sample donation projects


Clearly mark seed/demo content.

Do not make fake donation claims look real.



DESIGN DETAILS

Use a premium modern UI.

Suggested colors:

Warm off-white background
Deep charcoal text
Deep navy/indigo
Warm gold accent
Subtle green accent

Avoid making every section visually identical.

Use cards sparingly.

Use subtle shadows.

Use rounded corners but don't make the entire application look like a children's app.

Use tasteful animations:

page transitions


hover states


modal transitions


loading states


Do not over-animate.



IMPORTANT PRODUCT DETAIL

The website should feel like:

Reddit + Bible study + thoughtful Christian community

but with a calmer, safer, more respectful experience.

It should NOT feel like:

a generic church website


a Bible quote blog


a social media clone


an aggressive evangelism website


The central interaction is:

Question → Scripture → Explanation → Discussion



FIRST FEATURE TO SHOWCASE

Create an example question on the homepage:

Title:

If Jesus is God, why did He pray to God?

Use these references:

John 10:30


Luke 22:42


John 1:1


John 1:14


John 6:38


John 10:18


John 20:28


The explanation should be simple and respectful.

Do not fabricate quotations.

Clearly label:

Bible text


explanation


interpretation




FUTURE-READY AI

Do not implement AI in the first version unless it can be done cleanly.

However, architect the database/API so we can later add:

Ask Unfold

Users could ask:

"Why did Jesus say the Father is greater than Him?"

The future AI system should:

cite Scripture


explain context


distinguish Scripture from interpretation


show multiple interpretations when appropriate


avoid pretending certainty where Christians disagree


Leave a clear service abstraction for adding this later.



DELIVERABLE

Build the complete working application, not a static mockup.

Generate:

React application


TypeScript types


database schema


Supabase migrations


RLS policies


storage policies


authentication


responsive UI


admin dashboard


donation architecture


Paystack integration structure


SEO


error handling


loading states


seed data


documentation


Make the application compile and run.

Avoid TODO placeholders for core functionality.

Where external configuration is required, provide a clear setup screen/documentation rather than silently failing.

Most importantly:

Keep the application portable.

A developer should be able to:

Clone the project


Create their own Supabase project


Apply /supabase/migrations


Configure .env


Configure Paystack


Run the application


without depending on Bolt's Supabase project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4c8b655e-2e00-4507-98aa-6f8589a6324c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
