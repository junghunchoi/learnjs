var links = [
    // {
    //   href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css",
    //   rel: "stylesheet",
    //   integrity: "sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9",
    //   crossorigin: "anonymous"
    // },
    {
      href: "https://fonts.googleapis.com/css?family=Black+Han+Sans|Nanum+Brush+Script",
      rel: "stylesheet"
    }
  ];
  
  function loadLink(linkObj) {
    var link = document.createElement('link');
    link.href = linkObj.href;
    link.rel = linkObj.rel;

    if (linkObj.integrity) link.integrity = linkObj.integrity;
    if (linkObj.crossorigin) link.crossOrigin = linkObj.crossorigin;

    document.head.appendChild(link);
}

for (var i = 0; i < links.length; i++) {
    loadLink(links[i]);
}