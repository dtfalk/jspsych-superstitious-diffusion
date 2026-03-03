// =====================================================================
// plugin-loader.js — Load jsPsych plugins from CDN
// =====================================================================

var PLUGIN_URLS = [
  'https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3',
  'https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3',
  'https://unpkg.com/@jspsych/plugin-survey-text@1.1.3',
  'https://unpkg.com/@jspsych/plugin-survey-likert@1.1.3',
  'https://unpkg.com/@jspsych/plugin-video-keyboard-response@1.1.3',
  'https://unpkg.com/@jspsych/plugin-preload@1.1.3'
];

var _pluginsLoaded = 0;
var _pluginLoadCallbacks = [];

function onAllPluginsLoaded(callback) {
  if (_pluginsLoaded === PLUGIN_URLS.length) {
    callback();
  } else {
    _pluginLoadCallbacks.push(callback);
  }
}

(function() {
  function onPluginLoaded() {
    _pluginsLoaded++;
    if (_pluginsLoaded === PLUGIN_URLS.length) {
      _pluginLoadCallbacks.forEach(function(cb) { cb(); });
    }
  }

  PLUGIN_URLS.forEach(function(url) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = onPluginLoaded;
    script.onerror = function() {
      console.error('Failed to load plugin: ' + url);
      onPluginLoaded();
    };
    document.head.appendChild(script);
  });
})();
