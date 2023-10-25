var scriptList = [
    '../PracEditor/Packages/PracEditor-basic_style/src/button.js',
    '../PracEditor/Packages/PracEditor-font/src/font.js',
    '../PracEditor/Packages/PracEditor-core/src/selection.js',
    '../PracEditor/Packages/PracEditor-core/src/praceditor.js',
  ];
  
  scriptList.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
  });