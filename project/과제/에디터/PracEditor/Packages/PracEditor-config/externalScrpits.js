// var scripts = [];
//
// function loadScript(scriptObj, callback) {
//   var script = document.createElement("script");
//   script.src = scriptObj.src;
//   script.integrity = scriptObj.integrity;
//   script.crossOrigin = scriptObj.crossorigin;
//   script.onload = function () {
//     callback();
//   };
//   script.onerror = function () {
//     callback(new Error("Script load error for " + scriptObj.src));
//   };
//   document.body.appendChild(script);
// }
//
// function loadAllScripts(scripts, finalCallback) {
//   var loadedCount = 0;
//   for (var i = 0; i < scripts.length; i++) {
//     loadScript(scripts[i], function (error) {
//       if (error) {
//         finalCallback(error);
//         return;
//       }
//       loadedCount++;
//       if (loadedCount === scripts.length) {
//         finalCallback();
//       }
//     });
//   }
// }
//
// loadAllScripts(scripts, function (error) {
//   if (!error) {
//   } else {
//     console.error(error);
//   }
// });
