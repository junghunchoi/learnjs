const testUpload = (files) =>{
  const formData = new FormData();
  const req = new XMLHttpRequest();
  req.open('POST', 'http://localhost:1234/upload-request', true);
  req.setRequestHeader('X-File-Id', files.fileId);

  return fetch("http://localhost:1234/upload-request",{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: files.name,
    })
  })
  .then(res=> res.json())
  .then(res=>{

  })
}