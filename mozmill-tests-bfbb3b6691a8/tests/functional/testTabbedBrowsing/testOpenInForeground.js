/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is
 * Tobias Markus <tobbi.bugs@googlemail.com>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Anthony Hughes <ahughes@mozilla.com>
 *  Henrik Skupin <hskupin@mozilla.com>
 *  Geo Mealer <gmealer@mozilla.com>
 *  Remus Pop <remus.pop@softvision.ro>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// Include required modules
var prefs = require("../../../lib/prefs");
var tabs = require("../../../lib/tabs");
var utils = require("../../../lib/utils");

const localTestFolder = collector.addHttpResource('../../../data/');

const gDelay = 0;
const gTimeout = 5000;

var gTabOrder = [
  {index: 1, linkid: 3},
  {index: 2, linkid: 2},
  {index: 3, linkid: 1}
];

var setupModule = function(module)
{
  controller = mozmill.getBrowserController();

  tabBrowser = new tabs.tabBrowser(controller);
  tabBrowser.closeAllTabs();
}

var teardownModule = function()
{
  prefs.preferences.clearUserPref("browser.tabs.loadInBackground");
  utils.closeContentAreaContextMenu(controller);
  tabBrowser.closeAllTabs();
}

var testOpenInForegroundTab = function()
{
  prefs.openPreferencesDialog(controller, prefDialogCallback);

  // Open the HTML testcase:
  controller.open(localTestFolder + "tabbedbrowsing/openinnewtab.html");
  controller.waitForPageLoad();

  for(var i = 0; i < 3; i++) {
    // Switch to the first tab:
    tabBrowser.selectedIndex = 0;

    // Reference to the current link in the testcase:
    var currentLink = new elementslib.Name(controller.tabs.activeTab, "link_" + (i + 1));
    var contextMenuItem = new elementslib.ID(controller.window.document, "context-openlinkintab");

    if(i == 2) {
      // Open another tab by middle-clicking on the link
      tabBrowser.openInNewTab(currentLink);
    } else {
      // Open the context menu and open a new tab
      controller.rightClick(currentLink);
      controller.click(contextMenuItem);
      utils.closeContentAreaContextMenu(controller);
    }

    // Let's see if we have the right number of tabs open and that the first opened tab is selected
    controller.waitFor(function () {
      return tabBrowser.length === (i + 2);
    }, (i + 2) + " tabs have been opened");

    controller.waitFor(function () {
      return tabBrowser.selectedIndex === 1;
    }, "The first opened tab has been selected");
  }

  // Verify that the order of tabs is correct
  for each(tab in gTabOrder) {
    var linkId = new elementslib.ID(controller.tabs.getTab(tab.index), "id");
    controller.waitForElement(linkId);
    controller.assertText(linkId, tab.linkid);
  }

  // Click the close button of the second tab
  tabBrowser.selectedIndex = 1;
  tabBrowser.closeTab("closeButton");
  
  // Verify that we have 3 tabs now and the first tab is selected:
  controller.waitFor(function () {
    return tabBrowser.length === 3;
  }, "3 tabs have been opened");

  controller.waitFor(function () {
    return tabBrowser.selectedIndex === 0;
  }, "The first tab has been selected");
}

var prefDialogCallback = function(controller) {
  var prefDialog = new prefs.preferencesDialog(controller);
  prefDialog.paneId = 'paneTabs';

  // Ensure that 'Switch to tabs immediately' is checked:
  var switchToTabsPref = new elementslib.ID(controller.window.document, "switchToNewTabs");
  controller.waitForElement(switchToTabsPref, gTimeout);
  controller.check(switchToTabsPref, true);

  prefDialog.close(true);
}

/**
 * Map test functions to litmus tests
 */
// testOpenInForegroundTab.meta = {litmusids : [8088]};
