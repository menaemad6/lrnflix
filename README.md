# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/908c44de-bd63-4dd6-89af-267e4ab3be9d

## Google OAuth Integration

This project includes a Google OAuth integration for Google Meet functionality. The implementation uses a popup-based flow with the following components:

### Flow Overview
1. **React Component**: Opens a popup to Google's OAuth URL
2. **Google OAuth**: Redirects to Supabase Edge Function after user authorization
3. **Edge Function**: Exchanges authorization code for tokens and redirects to static HTML page
4. **Static HTML Page**: Executes JavaScript to send tokens back to parent window via postMessage
5. **React Component**: Receives tokens and saves them to Supabase

### Files Modified/Created
- `public/oauth-success.html` - Static HTML page that handles OAuth callback
- `supabase/functions/google-oauth-callback/index.ts` - Updated to redirect to static HTML
- `src/components/lectures/GoogleMeetIntegration.tsx` - React component for OAuth flow

### Testing the OAuth Flow
1. Start the development server: `npm run dev`
2. Navigate to a course with Google Meet integration
3. Click "Connect Google Account"
4. Complete the Google OAuth flow in the popup
5. The popup should close automatically and show success message

### Environment Variables
The OAuth callback function will automatically detect the frontend URL from:
1. `FRONTEND_URL` environment variable (if set)
2. Request origin header
3. Fallback to `http://localhost:8080`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/908c44de-bd63-4dd6-89af-267e4ab3be9d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/908c44de-bd63-4dd6-89af-267e4ab3be9d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
