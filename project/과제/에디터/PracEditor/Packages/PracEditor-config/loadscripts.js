var scriptList = [
    '../PracEditor/Packages/PracEditor-basic_style/src/button.js',
    '../PracEditor/Packages/PracEditor-font/src/font.js',
    '../PracEditor/Packages/PracEditor-core/src/selection.js',
    '../PracEditor/Packages/PracEditor-core/src/praceditor.js',
  ];
  
  function loadScriptsSequentially(scripts, index) {
    if (index < scripts.length) {
        var script = document.createElement('script');
        script.src = scripts[index];
        script.onload = function() {
            loadScriptsSequentially(scripts, index + 1);
        };
        document.body.appendChild(script);
    }
}

loadScriptsSequentially(scriptList, 0);