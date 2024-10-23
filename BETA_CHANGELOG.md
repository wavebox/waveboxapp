<h3>Version 10.130.2 beta <span class="date">23/10/2024</span></h3>
<ul>
  <li>Update to Chromium 130.0.6723.70</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.130.2.3)

---

<h3>Version 10.130.1 beta <span class="date">16/10/2024</span></h3>
<ul>
  <li>Update to Chromium 130.0.6723.59</li>
  <li>Fixes for dashboards</li>
  <li>Fix an issue where some Omnibox link rules would fail to trigger an action</li>
  <li>Fix notifications sometimes failing to re-open in the correct app</li>
  <li>Add support for middle mouse click on dashboard shortcuts opening them as background tabs</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.130.1.3)

---

<h3>Version 10.129.32 beta <span class="date">9/10/2024</span></h3>
<ul>
  <li>Update to Chromium 129.0.6668.101</li>
  <li>Fix an issue where duplicate tooltip titles were shown on the collection widget</li>
  <li>Update Brainbox so it doesn't scroll away from you as you're scrolling</li>
  <li>Update dependencies</li>
  <li>Fix a couple of typos</li>
  <li>Fix some tooltips failing to stay open when hovering over them</li>
  <li>Stability fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.32.3)

---

<h3>Version 10.129.30 beta <span class="date">2/10/2024</span></h3>
<ul>
  <li>Update to Chromium 129.0.6668.90</li>
  <li>Fixes for the Omnibox sometimes failing to open urls</li>
  <li>Fix an issue with the link engine where Omnibox matches would fail to change spaces in some configurations</li>
  <li>Stability fixes</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.30.3)

---

<h3>Version 10.129.29 beta <span class="date">27/9/2024</span></h3>
<ul>
  <li>Add the 'Create your own' link to the app search when creating a group</li>
  <li>Some of the action buttons in the tooltip headings vanished. Bring them back</li>
  <li>Update dependencies</li>
  <li>Fix some urls not launching from the omnibox</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.29.3)

---

<h3>Version 10.129.28 beta <span class="date">26/9/2024</span></h3>
<ul>
  <li>A small number of extensions could cause Wavebox to crash, fix this</li>
  <li>Add a dense display mode to the tasks widget</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.28.3)

---

<h3>Version 10.129.27 beta <span class="date">25/9/2024</span></h3>
<ul>
  <li>Update to Chromium 129.0.6668.71</li>
  <li>Fix some links failing to open</li>
  <li>UI tweaks for restoring cloud sync</li>
  <li>Under some configurations a cross space rule would fail to re-assign the space correctly. Fix this.</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.27.3)

---

<h3>Version 10.129.26 beta <span class="date">19/9/2024</span></h3>
<ul>
  <li>Update to Chromium 129.0.6668.59</li>
  <li>Speculative fix for privacy badger</li>
  <li>Under certain configurations the font used in the webdock would display incorrectly</li>
  <li>Usability fixes for the first install tooltips</li>
  <li>Fixes for Slack sign-in</li>
  <li>Usability fixes when creating a group from the webdock</li>
  <li>Make it easier to create a custom app from toolbar</li>
  <li>Stability fixes for the tab loading indicator</li>
  <li>Fixes for the focus mode popup not resizing the window correctly</li>
  <li>Fixes for the url pattern migration of link open rules</li>
  <li>Update dependencies</li>
  <li>UI tweaks</li>
  <li>UI updates for the switcher</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.26.3)

---

<h3>Version 10.129.19 beta <span class="date">11/9/2024</span></h3>
<ul>
  <li>Add an experimental flag that allows groups with more than one spaces to either be displayed in both spaces or just one</li>
  <li>Add a helper for when using a group with multiple spaces</li>
  <li>When saving tabs to a dashboard, custom tab names were saved from secondary windows but not the main Wavebox window. Fix this.</li>
  <li>Add a duplicate option to window open rules through the right-click menu</li>
  <li>Style fixes for the window open rule table</li>
  <li>Fix an issue where some global window open rules were not migrated properly</li>
  <li>Stability fixes for preference saving</li>
  <li>Update dependencies</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.19.3)

---

<h3>Version 10.129.17 beta <span class="date">9/9/2024</span></h3>
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
  <li>Usability improvements and fixes to the drag & drop space manager</li>
  <li>Update to Chromium 129.0.6668.29</li>
  <li>Update our underlying UI libraries for faster performance</li>
  <li>Fix a hard crash with the side panel</li>
  <li>Fix incognito search sometimes not working</li>
  <li>Fix crash on launch</li>
  <li>Fix theming for context menus</li>
  <li>Speculative fix for tab restore sometimes failing</li>
  <li>Fixes for the first-run tooltips</li>
  <li>Update dependencies</li>
  <li>Stability fixes</li>
  <li>Theme fixes</li>
</ul>

[Downloads](https://wavebox.io/download/release/10.129.17.3)

---
[More versions](https://wavebox.io/changelog/beta/)