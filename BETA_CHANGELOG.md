<h3>Version 10.125.29 beta <span class="date">29/5/2024</span></h3>
<ul>
  <li>Add options to customize the space unread badge in the webdock</li>
  <li>Fix an issue where the menu bar/tray settings would fail to open</li>
  <li>
    Usability fixes when using the space webdock, where it was possible to
    easily add apps from multiple spaces in a single group
  </li>
  <li>
    When using the spaces webdock, show a space indicator in groups that have
    a mix of different spaces
  </li>
  <li>Fix the background failing to set correctly on the new tab page</li>
  <li>Fix the icon picker failing to update icon previews in some configurations</li>
  <li>Fix a crash in settings where searching for an item and then clicking on it would show a blank window</li>
  <li>Fix an overflow issue in the dashboard drawer</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.29.3)

---

<h3>Version 10.125.28 beta <span class="date">24/5/2024</span></h3>
<ul>
  <li>Update to Chromium 125.0.6422.113</li>
  <li>Add an option to disable app store suggestions in the omnibox</li>
  <li>Reduce the amount of animation on start pages</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.28.3)

---

<h3>Version 10.125.24 beta <span class="date">23/5/2024</span></h3>
<ul>
  <li>Upgrade to Chromium 125.0.6422.77</li>
  <li>Add context menu items to sleep/wake a whole space</li>
  <li>When switching spaces, ensure the same space is selected when returning</li>
  <li>Fix the site search engines not appearing in settings</li>
  <li>Fix settings styling on Linux</li>
  <li>Fix the group name incorrectly changing when boosting an app</li>
  <li>Stability fixes when batch configuring settings</li>
  <li>Rename some of the missed cookie containers to spaces</li>
  <li>Fix some Desktop web apps repeatedly requiring the Gatekeeper configuration on startup</li>
  <li>Updates to the first run installer</li>
  <li>Make the grid group styling consistent with other apps when sleeping</li>
  <li>Add an alert state (audio playing, sharing video etc) icon to space icons in the webdock</li>
  <li>Fix an issue where there would be empty space in the webdock when there's less than 3 spaces</li>
  <li>Ensure spaces are populated when creating them through settings</li>
  <li>Update the Dashboard and Connect icons</li>
  <li>Style updates for groups so there's less grey blur</li>
  <li>Fixes for the Slack integration</li>
  <li>Desktop web apps installed from the location bar would vanish, fix this</li>
  <li>Style fixes for the link open manager (lots of things were still blue!)</li>
  <li>Fix an issue where adding chrome://newtab as an app would result in collection widgets failing to launch</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.24.3)

---

<h3>Version 10.125.15 beta <span class="date">17/5/2024</span></h3>
<ul>
  <li>Update to Chromium 125.0.6422.61</li>
  <li>Add an option to hide the plus button in the space webdock</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Fix Brainbox failing to launch</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.15.3)

---

<h3>Version 10.125.14 beta <span class="date">17/5/2024</span></h3>
<ul>
  <li>Update to Chromium 125.0.6422.61</li>
  <li>Add an option to hide the plus button in the space webdock</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.14.3)

---

<h3>Version 10.125.8 beta <span class="date">15/5/2024</span></h3>

<p>
  We've been busy working on a whole range of new UI updates for Wavebox, with the aim of
  making it easier for new users to get started and make it faster to do those tasks that
  you do every day.
</p>
<p>
  Firstly, we've made some important name changes to make things a little bit clearer. From
  now, <b>Cookie containers</b> will be known as <b>Spaces</b> and <b>Workspaces</b> will
  be known as <b>Dashboards</b>.
</p>

<p>
  Here's an overview of everything new:
</p>

<ul>
  <li>Wavebox has a brand new Icon</li>
  <li>Updates to our themes and colors, making Wavebox more purple (mmmmm, nice!)</li>
  <li>
    Webdock Spaces layout. This is a new layout called Spaces that shows only Groups &
    Apps in a single Space. It has the Spaces at the top of the webdock and Groups
    below it. This is now the default for new users, or can be turned on for existing
    setups manually by hovering over the settings cog in the bottom-left. We recommend
    that existing users, with complex setups create a new profile to try this out as
    it's a subset of what's available in the List and Explorer webdocks.
  </li>
  <li>
    Spaces (Cookie Containers) have been supercharged to make them more prominent
    <ul>
      <li>You can set the color for a Space and this will show as a tint in the main Wavebox window</li>
      <li>New icons and default naming for Spaces so they're easier to recognize</li>
      <li>An option to give Spaces a description so that you can assign each Space a specific task</li>
      <li>Make it clearer when Wavebox has automatically created a new Space to help prevent confusion</li>
    </ul>
  </li>
  <li>
    It's now easier to get started with Dashboards (Workspaces)
    <ul>
      <li>
        We've had feedback around creating new Dashboard apps and how it can be confusing in how Wavebox
        picked an existing Dashboard to display. We've changed this now, so that when you add a new
        dashboard app, you're prompted whether you want to have a new view on an existing Dashboard
        or create a new one.
      </li>
      <li>
        New users have a simpler dashboard setup without the dashboard burger menu meaning they can
        only see one dashboard at a time in an app. Advanced mode can be turned on in Settings or is enabled
        by default for Team users.
      </li>
      <li>Add an option to the main burger menu to open a Dashboard anywhere</li>
      <li>New wallpapers and colors to choose from</li>
      <li>Updates to the overall Dashboard/widget UI</li>
    </ul>
  </li>
  <li>
    There's now the option to have a simpler new tab page aimed at starting your web journey. This is
    the default for new users, but existing users can enable this by going to any dashboard, clicking on
    the settings cog (top-right) and turning off advanced mode.
  </li>
  <li>
    Adding Groups and apps
    <ul>
      <li>
        It's now easier and faster to create new Groups and add Apps using the on-screen popovers rather
        than the store and wizard.
      </li>
      <li>
        Groups: Click on the + icon at the bottom of the webdock to bring up the new Group pop-up.
        You can create a group straight from this pop-up. Clicking on Add an App, extends the pop-up
        so you can search for an app in the store in situ.
      </li>
      <li>
        Apps: Hover over the + icon in the group tab strip to bring up the new Apps pop-up, which
        has the same UI as the Group pop-up.
      </li>
    </ul>
  </li>
  <li>
    Settings
    <ul>
      <li>
        We've added an advanced mode toggle, so the settings that are use most frequently
        are more readily available. (Search still searches over all settings)
      </li>
      <li>
        We've tried to make settings more visually recognizable by using more groups and color
        sets, with the hope that it's easier to find what you're looking for.
      </li>
      <li>
        We've split the Appearance section of settings up into multiple sections, because lets face it,
        there's a lot of settings in there!
      </li>
    </ul>
  </li>
  <li>
    New user install experience. Wavebox has a brand new installer and masterclass, so if you're installing Wavebox for the first time,
    you'll get a new first-run experience that will help you get up and running quickly.
    <ul>
      <li>A branch new first-launch Wizard to help new users get up and running</li>
      <li>A new more interactive Wavebox Masterclass to help explain all the parts of Wavebox</li>
      <li>New first-run tooltips to explain some of the key parts of Wavebox</li>
      <li>Add an option to go back to previous masterclass steps, by clicking on step number</li>
    </ul>
  </li>
  <li>
    We've added tools to import Passwords, Bookmarks and History from other browsers. This is part of the
    first-run installer and also available through settings.
  </li>
  <li>Webdock icons now have a new look and feel and unread badges have subtle animations.</li>
  <li>
    Groups can now display the apps within them, rather than an icon. To turn this on,
    search settings for "grid view for groups".
  </li>
  <li>Group, App & Tab tooltips have a brand new styling.</li>
  <li>
    The main Wavebox window can now take the tint color from the active Space or Group to make
    each one more recognizable and at home in it's window. This can be turned on in Settings > Appearance.
  </li>
  <li>
    We've updated the icon designer. Based on feedback some users loved the new emoji picker, but some
    also found the old icon picker more useful. We've now combined the two so you can choose from a
    selection of emojis or built-in icons to create your own icon with just the right meaning.
  </li>
  <li>Improve the way Wavebox automatically generates some color variations so they're more visibly pleasing</li>
  <li>Add new icons throughout the app and subtle animations where they make sense</li>
  <li>New default color palettes for all the color pickers throughout the app</li>
  <li>Add an option use the light or dark Wavebox theme irregardless of operating systems theme</li>
  <li>You can now customize the styling of Groups & Apps when they're sleeping to select custom opacity and greyscale values</li>
  <li>We've added some additional keyboard shortcuts, including one to duplicate the current tab in the current window</li>
  <li>
    We've added a new feature request tool called Supahub that allows you to request features
    and up-vote existing requests. You can find this by hovering over the settings cog in the bottom-left
  </li>
  <li>You can now find out Discord community, by hovering over the settings cog in the bottom-left</li>
  <li>Web search in global search/dashboard search now uses the default search engine</li>
  <li>Stability fixes enabling more compile-time checking in large portions of our codebase</li>
  <li>Update to Chromium 125.0.6422.41</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.125.8.3)

---

<h3>Version 10.124.31 beta <span class="date">10/5/2024</span></h3>
<p>
  Update to Chromium 124.0.6367.202. This includes a critical security fix
  for CVE-2024-4671 that affects all Chromium-based browsers.
</p>
<p>
  Sorry about the batch of releases over the last two days - we'll stop now :-)
</p>

[Downloads](https://wavebox.io/download/release/10.124.31.3)

---

<h3>Version 10.124.30 beta <span class="date">9/5/2024</span></h3>
<ul>
  <li>
    Some users have reported that Wavebox unexpectedly takes focus.
    This release includes a speculative fix for this bug.
  </li>
</ul>

[Downloads](https://wavebox.io/download/release/10.124.30.3)

---

<h3>Version 10.124.29 beta <span class="date">9/5/2024</span></h3>
<ul>
  <li>Fix a hard crash reported by some users on startup</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.124.29.3)

---

<h3>Version 10.124.28 beta <span class="date">9/5/2024</span></h3>
<ul>
  <li>Stability fixes</li>
  <li>Add some additional logging tools for users having issues with sleep</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.124.28.3)

---
[More versions](https://wavebox.io/changelog/beta/)