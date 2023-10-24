const scripts = [
    {
      src: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
      integrity: "sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM",
      crossorigin: "anonymous"
    },
    {
      src: "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
      integrity: "sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4",
      crossorigin: "anonymous"
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js",
      integrity: "sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3",
      crossorigin: "anonymous"
    },
    {
      src: "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js",
      integrity: "sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V",
      crossorigin: "anonymous"
    }
  ];
  

  function loadScript(scriptObj) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = scriptObj.src;
      script.integrity = scriptObj.integrity;
      script.crossOrigin = scriptObj.crossorigin;
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }
  

  Promise.all(scripts.map(scriptObj => loadScript(scriptObj)))
    .then(() => {
        
    });


//   // 모든 스크립트 순차적 로딩
//   (async function() {
//     for (let scriptObj of scripts) {
//       await loadScript(scriptObj);
//     }
//   })();