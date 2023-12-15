function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
    //로딩에 성공하면 이걸 로드
    script.onload = () => callback(null, script);
    //로딩에 실패하면 이걸 로드
    script.onerror = () => callback(new Error(`Script load error for ${src}`));

    document.head.append(script);
}