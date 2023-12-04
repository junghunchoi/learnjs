var dropbox = document.querySelector('#uploaderArea');
var input_filename = document.querySelector('#fileUploader');
var $fileAddBtn = document.getElementById("fileAddBtn");

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
  var file = e.dataTransfer.files[0];


  this.style.backgroundColor = 'white'
  var fileList = e.dataTransfer.files

  for (var i = 0; i < fileList.length; i++) {
    input_filename.appendChild(makeFileList(fileList[i]))
    var newFileName = uniqueAlphaNumericId() + '-' + fileList[i].name;

    globalFileList.push(new File([fileList[i]], newFileName, { type: fileList[i].type}))
    globalFileList[i].originLastModified = fileList[i].lastModified
  }


  document.getElementById("uploaderArea").childNodes[0].data = "";
});

function getByteSize(size) {
  var byteUnits = ["KB", "MB", "GB", "TB"];

  for (var i = 0; i < byteUnits.length; i++) {
    size = Math.floor(size / 1024);

    if (size < 1024) {
      return size.toFixed(1) + byteUnits[i];
    }
  }
}

function makeFileList(file) {
  var $div = document.createElement('div');
  var $fileSize_span = document.createElement('span');
  var $fileName_span = document.createElement('span');
  var fileSize = getByteSize(file.size)
  var fileName = file.name

  $div.style.border = "0.2rem outset";
  $div.style.borderRadius = "12px"
  $div.id = fileName
  $fileName_span.style.margin = "10px"
  $fileSize_span.style.margin = "10px"
  $fileName_span.textContent = fileName
  $fileSize_span.textContent = fileSize
  $div.appendChild($fileName_span)
  $div.appendChild($fileSize_span)

  return $div;
}

$fileAddBtn.addEventListener("change", function (e) {
  e.preventDefault();
  this.style.backgroundColor = 'white'
  var fileList = e.target.files;

  for (var i = 0; i < fileList.length; i++) {
    input_filename.appendChild(makeFileList(fileList[i]))
    var newFileName = uniqueAlphaNumericId() + '-' + fileList[i].name;

    globalFileList.push(new File([fileList[i]], newFileName, { type: fileList[i].type}))
    globalFileList[i].originLastModified = fileList[i].lastModified
  }
  document.getElementById("uploaderArea").childNodes[0].data = "";
})


function uniqueAlphaNumericId() {
  var heyStack = "0123456789abcdefghijklmnopqrstuvwxyz";
  var randomInt = function() {
    return Math.floor(Math.random() * Math.floor(heyStack.length));
  };

  var result = [];
  for (var i = 0; i < 24; i++) {
    result.push(heyStack[randomInt()]);
  }

  return result.join("");
}