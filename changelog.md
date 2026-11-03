# Changelog

## November 3, 2026

### Fixes

- Uploads work again. Banners, avatars, backgrounds, badges and music tracks were failing with "Failed to upload banner" or "audio upload failed". If your upload failed today, just do it again.

## October 31, 2026

### New

- Added **Widgets background** on the Widgets page. Change the color and transparency of all your widget cards, so they match your music card and the rest of your profile.

### Improvements

- Badges marked **Not available**, like Owner, Developer and Early, now have a small **?** that explains why you can't get them.
- Clicking a featured profile on the homepage now opens it in a new tab.

### Fixes

- Hitting **Sync** on the badges page no longer shows a confusing "Server Components render" error. You now see the real reason, like "You're updating too fast" or "Connect your Discord account first".
- On phones, the **Avatar Decoration** and **Profile Effect** pickers now fit the screen and scroll, so you can reach every decoration and effect.

## October 29, 2026

### New

- Added **Link Styling** to the Colors page. Pick an icon color and a text color for your big links.
- Added **music card background**. Change the color and transparency of the music player card on the Music page.
- Buying a **Custom Domain** now gives you the **Custom Domain** badge and the Custom Domain role in our Discord server, like other paid badges.

### Fixes

- Featured profiles on the homepage now show each profile's current avatar, instead of an old one.

## October 28, 2026

### Fixes

- Fixed a yellow box showing around charts, like the Views chart, after you clicked on them.
- Fixed pages crashing with "Something went wrong" after translating iuno.lol with your browser, like Google Translate.

## October 27, 2026

### New

- Added **Custom Domain** ($0.99 / ₹90). Each one lets you connect one custom domain, and anyone can buy it, no Premium needed.
- Added **custom domains** in Settings → Domain. Connect your own domain for your profile or your Image Host, add two DNS records, and hit Verify.
- Custom domains can be **Private** (only you) or **Public** (anyone on iuno.lol can pick them). Pick which domain your profile and Image Host links use. Your iuno.lol link always keeps working, and if a domain is removed everyone using it goes back to iuno.lol and host.iuno.lol.

### Improvements

- Every profile now gives search engines a short description, using your embed description or your bio, so profiles show up better in Google results.

## October 26, 2026

### New

- Added the **Halloween 2026** badge. Open your badges page between October 26 and November 2 to claim it, and it stays on your account for good. After November 2 it can no longer be earned.
- Early badge holders now get the **Early** role in our Discord server.

### Improvements

- The Early badge now shows **Not available** for anyone who can't earn it, instead of only a lock icon.
- Badge icons on the badges page no longer have a glow behind them.

### Fixes

- Fixed embed card backgrounds and icons not showing when your profile link was shared. If yours shows a blank card, upload your embed images again.
- Fixed some new accounts getting a very large UID. Those accounts now have normal UIDs.
- Fixed the badges page sometimes staying on the old tab on mobile when you tapped Badge Customization.
- Fixed the music page saying "Background sound is on" when your backgrounds were only images, with no way to turn it off.
- Fixed profile details in the bottom left and right corners being split onto two lines on mobile. They now sit on one line, like the top of the profile.

## October 24, 2026

### New

- Added a **SoundCloud widget**. Show a SoundCloud artist with their photo, follower and track counts, and verification badge.
- SoundCloud widgets can also show a **single track** with its artwork, plays, likes and duration.
- The homepage now shows **two showcase profiles**
- The footer's **Contact** section is now **Socials**, with links to our X, Instagram and Threads.
- Added **featured profiles** to the homepage. A scrolling strip of community profiles sits at the bottom of the first screen; hover it to pause, and click any profile to open it.
- Profile details can now go in the **left or right corner**. Pick a corner for each detail at the top of your profile, the bottom of your profile, or the bottom of the page.

### Improvements

- The image host now accepts files up to **500MB** each, up from 200MB.
- Free accounts can now upload backgrounds up to **20MB**, up from 10MB.
- Upload limits are now exact everywhere. A file over the limit is rejected as soon as you pick it, instead of after it has finished uploading.
- Music cover art can now be up to 5MB when editing a track, the same as when uploading one.

### Fixes

- Fixed profile sections showing up twice on normal one-page profiles.
- Fixed views, likes and the comments button staying behind on the first screen in sectioned scroll. They now follow you to every section.
- Fixed cursor trails not working past the first section in sectioned scroll.
- Fixed logging in with an email code. Correct codes were being rejected as wrong.
- Fixed changing your password signing you out of the device you changed it on. Other devices are still signed out.
- Fixed Discord sign-ins with an authenticator app allowing only one try at the code. You now get up to 5.
- Fixed signup and settings showing "Something went wrong", or naming the wrong field, when an email or username was already taken.
- Fixed Razorpay purchases not being delivered when the checkout page was closed too early. Your purchase now arrives even if you leave right after paying.
- Fixed photos under 5MB being rejected after cropping. Cropped avatars, banners and embed images are now saved much smaller.
- Fixed alias tokens giving different slots depending on when you bought Premium, and refunds taking away more than the purchase gave. Each token now gives 4 slots with Premium or 1 without.

### Security

- Fixed private templates. Their settings could be viewed by anyone with the template's ID; now only the creator can see them.

## October 23, 2026

- Added **profile sections**. Create your own sections with a title, an optional description and up to three categories — Bio, Links, Widgets and Music. Only the categories you include show on your profile.
- Sections can include their own bio, so your card bio stays exactly as it is.
- Sections can be **dragged** up or down with the grip handle to change their order.
- You can switch between a normal one-page profile and **sectioned scroll**, where each section gets its own screen.
- The Widgets, Music and Links pages now show a small warning with a **Create section** shortcut when no section uses that category yet.
- Music now starts on your first click or tap when your browser blocks autoplay by default.
- Fixed the profile card bio overlapping the UID and date row.

## October 21, 2026

- You can now like or dislike your own profile. One vote per account, same as everyone else.
- Template covers are now captured faster, with a backup screenshot service so a cover still gets generated if the main one is down.
- View counts are now protected from fake traffic. Scripted requests are ignored, and the same visitor counts once per week.
- The view check runs in the background, so profile pages stay fast and never wait for it.
- Dragging on a profile no longer paints the background in your browser's selection colour, and profile photos, banners and backgrounds can no longer be dragged or selected by accident.
- You can now edit a song you uploaded — change its cover, title, artist or lyrics without deleting it and uploading it again.

## October 20, 2026

- Added an **Apple Music widget**. Show any track, album or artist with its artwork, name, artist, release year and track count.
- Banner uploads now open a **crop tool**, so you can choose exactly which part of the image shows on your profile.
- Long widget titles and subtitles now scroll back and forth instead of getting cut off.
- Link icons now scale their background box with the icon size, so small icons no longer sit in oversized boxes.
- Added an **icon spacing slider** to the links page, so you can control the gap between your links.

## October 19, 2026

- Added an **Instagram widget**. Show any public profile with its photo, follower/following/post counts and verification badge.
- All uploaded images and videos now load from a faster CDN, so profiles and the image host open quicker.
- Mobile is now fully fixed across the site, from phones up to desktop.
- Added an **unsaved-changes guard** to the dashboard. If you try to leave with edits, the save bar shakes red and asks you to save or revert first.
- Fixed the music volume control on touch screens. Tapping the icon now opens the slider, and a second tap mutes.
- Cleaned up mobile layouts for profiles, widgets, badges, templates and the image host so nothing overflows or stretches.

## October 17, 2026

- Rebuilt the profile card preview for phones. It stays hidden until you tap the eye button, then opens full screen.
- Made the pricing page smoother on mobile and removed the blinking pink text effect.

## October 15, 2026

- Added more control over widget placement.
- Fixed several small responsiveness issues across the dashboard.
