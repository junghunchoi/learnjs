const dropbox = document.querySelector('#uploaderArea');
const input_filename = document.querySelector('#fileUploader');
const $fileAddBtn = document.getElementById("fileAddBtn")

//박스 안에 drag 하고 있을 때
dropbox.addEventListener('dragover', function (e) {
  e.preventDefault();
  this.style.backgroundColor = 'rgb(13 110 253 )';
});

//박스 밖으로 drag가 나갈 때
dropbox.addEventListener('dragleave', function (e) {
  this.style.backgroundColor = 'white';
});

//박스 안에 drop 했을 때
dropbox.addEventListener('drop', function (e) {
  e.preventDefault();
  this.style.backgroundColor = 'white'
  let fileList = e.dataTransfer.files

  for (var i = 0; i < fileList.length; i++) {
    input_filename.appendChild(makeFileList(fileList[i]))
    globalFileList.push(fileList[i])
  }
  document.getElementById("uploaderArea").childNodes[0].data = "";
});

function getByteSize(size) {
  const byteUnits = ["KB", "MB", "GB", "TB"];

  for (let i = 0; i < byteUnits.length; i++) {
    size = Math.floor(size / 1024);

    if (size < 1024) {
      return size.toFixed(1) + byteUnits[i];
    }
  }
}

function makeFileList(file) {
  var $span = document.createElement('div');
  var $fileSize_span = document.createElement('span');
  var $fileName_span = document.createElement('span');
  var fileSize = getByteSize(file.size)
  var fileName = file.name

  $span.style.border = "0.2rem outset";
  $span.style.borderRadius = "12px"
  $fileName_span.style.margin = "10px"
  $fileSize_span.style.margin = "10px"
  $fileName_span.textContent = fileName
  $fileSize_span.textContent = fileSize
  $span.appendChild($fileName_span)
  $span.appendChild($fileSize_span)

  return $span;
}

$fileAddBtn.addEventListener("change", function (e) {
  e.preventDefault();
  console.log("change")
  this.style.backgroundColor = 'white'
  let fileList = e.target.files;

  for (var i = 0; i < fileList.length; i++) {
    input_filename.appendChild(makeFileList(fileList[i]))
    globalFileList.push(fileList[i])
  }

  document.getElementById("uploaderArea").childNodes[0].data = "";
})
