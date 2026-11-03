# New Update: V1.0.4

**Released: October 29, 2026**

## What's new

- **Link Styling.** Pick an icon color and a text color for your big links on the Colors page.
- **Music card background.** Change the color and transparency of your music player card.
- **Custom Domain badge.** Buying a Custom Domain now gives you the Custom Domain badge and role in our Discord server.
- **Widgets background.** Change the color and transparency of your widget cards on the Widgets page.

## Improvements

- **Why a badge is not available.** Badges like Owner, Developer and Early now have a small ? that explains why you can't get them.
- **Featured profiles open in a new tab.** Clicking a profile on the homepage strip keeps the homepage open.

## Fixes

- Featured profiles on the homepage now show each profile's current avatar.
- Badge **Sync** now shows the real reason when it fails, instead of a "Server Components render" error.
- The Avatar Decoration and Profile Effect pickers now scroll properly on phones.
- **Uploads work again.** Banners, avatars, backgrounds, badges and music tracks were failing with "Failed to upload banner" or "audio upload failed". If your upload failed, just do it again.

---

# Previous Update: V1.0.3

**Released: October 26, 2026**

## What's new

- **Custom Domain.** $0.99 / ₹90 each. One purchase = one custom domain, and anyone can buy it.
- **Custom domains.** Connect your own domain in Settings → Domain and use it for your profile (yourdomain.com/username) or your Image Host links. Add two DNS records, hit Verify, and it's live.
- **Private or Public.** Keep a domain to yourself, or make it public so other iuno.lol users can use it too. Your iuno.lol link always keeps working, and if a domain is removed everyone goes back to iuno.lol and host.iuno.lol.

## Improvements

- **Better Google results.** Every profile now gives search engines a short description, taken from your embed description or your bio.

## Fixes

- Embed card backgrounds and icons show up again when your profile link is shared. If yours shows a blank card, upload your embed images again.
- New accounts no longer get a very large UID. The accounts that did now have normal UIDs.
- Switching tabs on the badges page now works on the first tap on mobile, instead of staying on the old tab.
- The music player is no longer blocked by "Background sound is on" when your backgrounds are only images.
- On mobile, profile details in the left and right bottom corners sit on one line again, instead of being split across two lines with a big gap.
- Clicking a chart, like the Views chart, no longer draws a yellow box around it.
- Translating iuno.lol with your browser, like Google Translate, no longer crashes the page.

---

# Previous Update: V1.0.2

**Released: October 26, 2026**

## What's new

- **SoundCloud widget.** Show any SoundCloud artist with their photo, follower count, track count and verification badge. Paste a handle or profile link and it updates live.
- **SoundCloud tracks.** Show a single SoundCloud track with its artwork, plays, likes and duration. Paste the track link and it fills in on its own.
- **Two showcase profiles.** The homepage now switches between 2 profiles
- **Socials.** The footer's Contact section is now Socials, with links to our X, Instagram and Threads.
- **Featured profiles.** The homepage now has a scrolling strip of community profiles right on the first screen. Hover to pause, click to visit.
- **Choose a corner for profile details.** Put each detail in the left or right corner at the top of your profile, the bottom of your profile, or the bottom of the page.
- **Halloween 2026 badge.** Open your badges page between October 26 and November 2 to claim it. It stays on your account for good, but can't be earned after November 2.
- **Early role on Discord.** Early badge holders now get the Early role in our Discord server.

## Improvements

- **Bigger image host uploads.** Files can now be up to 500MB each, up from 200MB.
- **Bigger backgrounds.** Free accounts can now upload backgrounds up to 20MB, up from 10MB.
- **Exact upload limits.** Every upload checks the size as soon as you pick a file, so you no longer wait for a big file to upload only to be told it's too large.
- **Track covers.** Cover art can now be up to 5MB when editing a track, the same as when uploading one.
- **Clearer Early badge.** It now shows "Not available" for anyone who can't earn it, instead of only a lock icon.
- **Cleaner badge icons.** Badge icons on the badges page no longer have a glow behind them.

## Fixes

- Profile sections no longer show up twice on normal one-page profiles.
- In sectioned scroll, views, likes and the comments button now stay on screen in every section instead of being left on the first one.
- Cursor trails now work on every section in sectioned scroll, not just the first one.
- Email code login works again. A correct code was always being reported as wrong.
- Changing your password keeps you signed in on the device you changed it on. Other devices are still signed out.
- Discord sign-ins with an authenticator app now allow up to 5 tries at the code. A single typo no longer sends you back to the start.
- Signup and settings now tell you exactly whether your email or your username is taken, instead of "Something went wrong" or naming the wrong field.
- Razorpay purchases are now always delivered, even if you close the page right after paying.
- Photos under 5MB are no longer rejected after cropping. Cropped avatars, banners and embed images are now saved much smaller.
- Alias tokens now give the same slots no matter when you bought Premium (4 with Premium, 1 without), and refunds only take back what the token gave.

## Security

- **Private templates are private.** Their settings could be viewed by anyone with the template's ID. Now only the creator can see them.

---

# Previous Update: V1.0.1

**Released: October 23, 2026**

## What's new

- **Profile sections.** Build your own sections with a title, an optional description and up to three categories — Bio, Links, Widgets and Music. Only the categories you include show on your profile.
- **Sectioned scroll.** Switch between a normal one-page profile and sectioned scroll, where every section gets its own screen.
- **Separate section bio.** Each section can have its own bio, so your card bio stays exactly as it is.
- **Create section shortcuts.** The Widgets, Music and Links pages now warn you when nothing is showing and link straight to the section builder.
- **Apple Music widget.** Show any track, album or artist with its artwork, name, artist, release year and track count. Paste a link and the type is detected on its own, or pick it yourself.
- **Banner crop tool.** Banner uploads now open a crop tool, so you can choose exactly which part of the image shows on your profile.
- **Icon spacing slider.** Link icons now scale their background box with the icon size, and a new slider controls the gap between them. Small icons no longer sit in oversized boxes.
- **Like your own profile.** You can now like or dislike your own profile — one vote per account, same as everyone else.
- **Edit your tracks.** Songs you uploaded can now be edited — change the cover, title, artist or lyrics without deleting the track and uploading it again.

## Improvements

- Music now starts on your first click or tap when your browser blocks autoplay by default, instead of staying silent.
- Section warnings are smaller and sit inline, and the section menu is cleaner with just Edit and Delete.
- Fixed the profile card bio overlapping the UID and date row.
- Long widget titles and subtitles now scroll back and forth instead of getting cut off.
- Template covers are captured faster, with a backup screenshot service so a cover still gets generated if the main one is down.
- Widgets, profile links and dashboard settings all save and preview consistently across the editor and the public profile.
- View counts are now protected from fake traffic. Only real browsers can add a view
- Profile backgrounds, banners and avatars can no longer be selected or dragged, so dragging on a page no longer turns the background into your browser's highlight colour.
