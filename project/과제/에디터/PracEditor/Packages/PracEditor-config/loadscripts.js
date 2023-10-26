var scriptList = [
    '../PracEditor/Packages/PracEditor-basic_style/src/button.js',
    '../PracEditor/Packages/PracEditor-font/src/font.js',
    '../PracEditor/Packages/PracEditor-core/src/selection.js',
    '../PracEditor/Packages/PracEditor-core/src/praceditor.js',
  ];
  
  for (var i = 0; i < scriptList.length; i++) {
    var script = document.createElement('script');
    script.src = scriptList[i];
    document.body.appendChild(script);
}