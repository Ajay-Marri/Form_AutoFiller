# JobAutoFill Chrome Extension (Manifest V3)

Local-first personal job application autofill extension. The profile is stored in
Chrome's local extension storage and is not sent to a server.

## How to Load in Google Chrome

1. Open Google Chrome or any Chromium browser (Brave, Edge, Arc).
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click **Load unpacked**.
5. Select this `extension` folder.
6. The JobAutoFill icon will appear in your Chrome toolbar!
7. Open a job application page and click the extension icon.
8. Enter and save your own profile, then click **Scan and fill matching empty fields**.
9. Review every field on the page yourself. The extension does not submit forms
   and does not overwrite non-empty fields.

The extension requests access to all websites so its content script can inspect
application forms. Chrome may block it on internal pages and some restricted
sites. It does not send profile data or page contents over the network.
