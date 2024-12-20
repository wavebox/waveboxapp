<h3>Version 10.131.18 <span class="date">20/12/2024</span></h3>
<ul>
  <li>Update to Chromium 131.0.6778.205 which includes some important security updates</li>
  <li>Fixes for the ClickUp integration</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.131.18.2)

---

<h3>Version 10.131.17 <span class="date">12/12/2024</span></h3>

<ul>
  <li>Update to Chromium 131.0.6778.140 - this includes some important security updates for 3rd party libraries</li>
  <li>Update some UI so it's clear if you're closing a popover or removing an icon</li>
  <li>Fix an issue where settings would sometimes fail to launch correctly</li>
  <li>Under some configurations, Wavebox could incorrectly open/hide the side panel, fix for this</li>
  <li>Performance fix for some graphics layers, especially on slower devices</li>
  <li>Update dependencies</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.131.17.2)

---

<h3>Version 10.131.16 <span class="date">4/12/2024</span></h3>
<ul>
  <li>Update to Chromium 131.0.6778.109</li>
  <li>Fix the cookies setting not working</li>
  <li>Performance fixes when searching for apps in Wavebox</li>
  <li>Add some pre-rendering to the webdock when there's a large amount of apps for speedier scrolling</li>
  <li>Fixes for Wavebox connect when using file sharing behind a proxy</li>
  <li>UI tweaks</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.131.16.2)

---

<h3>Version 10.131.15 <span class="date">21/11/2024</span></h3>
<p>
  This hot fix release, contains bug fixes for some hard crashes that
  were reported in version 10.131.12. Here's everything that's new:
</p>
<ul>
  <li>Upgrade to Chromium 131.0.6778.70 for enhanced security and performance optimizations.</li>
  <li>Improved resource management to prevent potential memory leaks when the app has been running for long periods</li>
  <li>Fixed an issue causing dashboards to not load completely under certain configurations</li>
  <li>Resolved a bug where notifications would intermittently fail to open in the corresponding app</li>
  <li>Fixed an issue leading to duplicate tooltips appearing on some widgets</li>
  <li>Fix an issue were themes could generate some wildly different colors for parts of the UI</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
  <li>Fix a hard crash when using the right-click menu in secondary windows</li>
  <li>Fix styling issues with the extensions page</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.131.15.2)

---

<h3>Version 10.131.12 <span class="date">20/11/2024</span></h3>

<ul>
  <li>Upgrade to Chromium 131.0.6778.70 for enhanced security and performance optimizations.</li>
  <li>Improved resource management to prevent potential memory leaks when the app has been running for long periods</li>
  <li>Fixed an issue causing dashboards to not load completely under certain configurations</li>
  <li>Resolved a bug where notifications would intermittently fail to open in the corresponding app</li>
  <li>Fixed an issue leading to duplicate tooltips appearing on some widgets</li>
  <li>Fix an issue were themes could generate some wildly different colors for parts of the UI</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.131.12.2)

---

<h3>Version 10.130.3 <span class="date">4/11/2024</span></h3>
<ul>
  <li>Update to Chromium 130.0.6723.92</li>
  <li>Fixes for dashboards</li>
  <li>Fix an issue where some Omnibox link rules would fail to trigger an action</li>
  <li>Fix notifications sometimes failing to re-open in the correct app</li>
  <li>Add support for middle mouse click on dashboard shortcuts opening them as background tabs</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.130.3.2)

---

<h3>Version 10.129.32 <span class="date">10/10/2024</span></h3>
<ul>
  <li>Update to Chromium 129.0.6668.101</li>
  <li>Fix an issue where duplicate tooltip titles were shown on the collection widget</li>
  <li>Update Brainbox so it doesn't scroll away from you as you're scrolling</li>
  <li>Fixes for the Omnibox sometimes failing to open urls</li>
  <li>Fix an issue with the link engine where Omnibox matches would fail to change spaces in some configurations</li>
  <li>Fix a couple of typos</li>
  <li>Fix some tooltips failing to stay open when hovering over them</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.32.2)

---

<h3>Version 10.129.29 <span class="date">27/9/2024</span></h3>
<ul>
  <li>Fix a crash that some users had reported shortly after launching</li>
  <li>A small number of extensions could cause Wavebox to crash, fix this</li>
  <li>Add the 'Create your own' link to the app search when creating a group</li>
  <li>Some of the action buttons in the tooltip headings vanished. Bring them back</li>
  <li>Fix some urls not launching from the omnibox</li>
  <li>Add a dense display mode to the tasks widget</li>
  <li>Update dependencies</li>
</ul>

<p>
  In case you missed yesterdays 10.129.27 release, here's everything else that's new!
</p>

<h4>🆕 New!</h4>
<ul>
  <li>
    An all new, more capable link open engine with more flexibility to
    create global rules and tailor your Wavebox! We've added an all-new UI
    for rule management - no more hunting through apps to find where a rule
    was created. Wavebox now features an intuitive list (with search of course)
    so you can easily find and manage each rule.
    <br /><br />
    We've added robust support for cross-space rules across the board. If you need
    to move a link to a new space, Wavebox gives you the tools to do this!
    <br /><br />
    We've also made it easier to figure out when a rule is being applied, with
    a new indicator in the URL bar. This will show you which rule is being applied
    to the current page, and you can click on it to see more details.
    <br /><br />
    Rules now have support for more scopes (where they're opened from), with then new
    version allowing matches for:
    <ul>
      <li>Anywhere in Wavebox</li>
      <li>Typed into the Omnibox/Location bar</li>
      <li>Anywhere in a Space</li>
      <li>Anywhere in a Group</li>
      <li>From within an app</li>
      <li>Outside of Wavebox (if Wavebox is set as your default browser)</li>
    </ul>

    URL matching has been enhanced, making it simpler to create URL matches with support for:
    <ul>
      <li>Contains</li>
      <li>Starts with</li>
      <li>Equality</li>
      <li>Patterns</li>
      <li>Hostnames</li>
    </ul>
  </li>
  <li>Add more options to customize and re-order the items in the Group, App & Tab tooltips</li>
  <li>Add an experimental flag that allows groups with more than one spaces to either be displayed in both spaces or just one</li>
  <li>Add a helper for when using a group with multiple spaces</li>
  <li>Make it easier to create a custom app from toolbar by pre-filling a bunch of things based on the search</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 129.0.6668.71</li>
  <li>Usability improvements and fixes to the drag & drop space manager</li>
  <li>Update our underlying UI libraries for faster performance</li>
  <li>Add a duplicate option to window open rules through the right-click menu</li>
  <li>Under certain configurations the font used in the webdock would display incorrectly, fix this</li>
  <li>Usability fixes when creating a group from the webdock</li>
  <li>Stability fixes for the tab loading indicator</li>
  <li>UI updates for the switcher</li>
  <li>UI tweaks for restoring cloud sync</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>When saving tabs to a dashboard, custom tab names were saved from secondary windows but not the main Wavebox window. Fix this.</li>
  <li>Fix a hard crash with the side panel</li>
  <li>Fix incognito search sometimes not working</li>
  <li>Fix crash on launch</li>
  <li>Fix theming for context menus</li>
  <li>Speculative fix for tab restore sometimes failing</li>
  <li>Fixes for the first-run tooltips</li>
  <li>Stability fixes for preference saving</li>
  <li>Stability fixes</li>
  <li>Speculative fix for privacy badger</li>
  <li>Usability fixes for the first install tooltips</li>
  <li>Fixes for Slack sign-in</li>
  <li>Fixes for the focus mode popup not resizing the window correctly</li>
  <li>Fixes for the url pattern migration of link open rules</li>
  <li>Fix some links failing to open</li>
  <li>Under some configurations a cross space rule would fail to re-assign the space correctly. Fix this.</li>
  <li>Theme fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.29.2)

---

<h3>Version 10.129.27 <span class="date">25/9/2024</span></h3>
<h4>🆕 New!</h4>
<ul>
  <li>
    An all new, more capable link open engine with more flexibility to
    create global rules and tailor your Wavebox! We've added an all-new UI
    for rule management - no more hunting through apps to find where a rule
    was created. Wavebox now features an intuitive list (with search of course)
    so you can easily find and manage each rule.
    <br /><br />
    We've added robust support for cross-space rules across the board. If you need
    to move a link to a new space, Wavebox gives you the tools to do this!
    <br /><br />
    We've also made it easier to figure out when a rule is being applied, with
    a new indicator in the URL bar. This will show you which rule is being applied
    to the current page, and you can click on it to see more details.
    <br /><br />
    Rules now have support for more scopes (where they're opened from), with then new
    version allowing matches for:
    <ul>
      <li>Anywhere in Wavebox</li>
      <li>Typed into the Omnibox/Location bar</li>
      <li>Anywhere in a Space</li>
      <li>Anywhere in a Group</li>
      <li>From within an app</li>
      <li>Outside of Wavebox (if Wavebox is set as your default browser)</li>
    </ul>

    URL matching has been enhanced, making it simpler to create URL matches with support for:
    <ul>
      <li>Contains</li>
      <li>Starts with</li>
      <li>Equality</li>
      <li>Patterns</li>
      <li>Hostnames</li>
    </ul>
  </li>
  <li>Add more options to customize and re-order the items in the Group, App & Tab tooltips</li>
  <li>Add an experimental flag that allows groups with more than one spaces to either be displayed in both spaces or just one</li>
  <li>Add a helper for when using a group with multiple spaces</li>
  <li>Make it easier to create a custom app from toolbar by pre-filling a bunch of things based on the search</li>
</ul>

<h4>🔧 Updates & improvements</h4>
<ul>
  <li>Update to Chromium 129.0.6668.71</li>
  <li>Usability improvements and fixes to the drag & drop space manager</li>
  <li>Update our underlying UI libraries for faster performance</li>
  <li>Add a duplicate option to window open rules through the right-click menu</li>
  <li>Under certain configurations the font used in the webdock would display incorrectly, fix this</li>
  <li>Usability fixes when creating a group from the webdock</li>
  <li>Stability fixes for the tab loading indicator</li>
  <li>UI updates for the switcher</li>
  <li>UI tweaks for restoring cloud sync</li>
  <li>Update dependencies</li>
</ul>

<h4>🐛 Fixes</h4>
<ul>
  <li>When saving tabs to a dashboard, custom tab names were saved from secondary windows but not the main Wavebox window. Fix this.</li>
  <li>Fix a hard crash with the side panel</li>
  <li>Fix incognito search sometimes not working</li>
  <li>Fix crash on launch</li>
  <li>Fix theming for context menus</li>
  <li>Speculative fix for tab restore sometimes failing</li>
  <li>Fixes for the first-run tooltips</li>
  <li>Stability fixes for preference saving</li>
  <li>Stability fixes</li>
  <li>Speculative fix for privacy badger</li>
  <li>Usability fixes for the first install tooltips</li>
  <li>Fixes for Slack sign-in</li>
  <li>Fixes for the focus mode popup not resizing the window correctly</li>
  <li>Fixes for the url pattern migration of link open rules</li>
  <li>Fix some links failing to open</li>
  <li>Under some configurations a cross space rule would fail to re-assign the space correctly. Fix this.</li>
  <li>Theme fixes</li>
</ul>


[Downloads](https://wavebox.io/download/release/10.129.27.2)

---

<h3>Version 10.128.7 <span class="date">12/9/2024</span></h3>
<ul>
  <li>Update to Chromium 128.0.6613.13</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.128.7.2)

---
[More versions](https://wavebox.io/changelog/stable/)