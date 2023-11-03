/*
모듈 임포트: 필요한 라이브러리와 모듈들을 가져옵니다.

express: 웹 서버를 구축하기 위한 프레임워크
cors: Cross-Origin Resource Sharing을 위한 미들웨어
fs: 파일 시스템 작업을 위한 라이브러리
promisify: 콜백 패턴을 프로미스 패턴으로 바꾸기 위한 유틸리티
busboy: 멀티파트 폼 데이터를 파싱하기 위한 라이브러리
유틸리티 함수:

uniqueAlphaNumericId: 랜덤한 알파뉴메릭 ID를 생성하는 함수
getFilePath: 파일의 경로를 생성하는 함수
미들웨어 설정: 서버에 JSON 처리 및 CORS 미들웨어를 적용합니다.

엔드포인트 정의:

/upload-request: 파일 업로드 요청을 받아, 해당 파일에 대한 유니크한 ID를 생성하고 클라이언트에 반환합니다.
/upload-status: 주어진 파일 이름과 ID로 해당 파일의 현재 업로드 상태(크기)를 반환합니다.
/upload: 파일의 청크를 업로드하는 엔드포인트. 'Content-Range' 및 'X-File-Id' 헤더를 기반으로 파일 청크를 저장합니다.
서버 시작: 1234 포트에서 서버를 실행합니다.

이 코드는 청크 기반의 파일 업로드 시스템을 구현한 것입니다. 사용자는 파일을 여러 청크로 나눠 서버에 업로드할 수 있으며, 서버는 이 청크들을 조합하여 원본 파일을 재생성합니다.
 */


const express = require('express');
const cors = require('cors');
const fs = require('fs');
const {promisify} = require('util');
const Busboy = require('busboy');

const app = express();
const getFileDetails = promisify(fs.stat);

const uniqueAlphaNumericId = (() => {
	const heyStack = '0123456789abcdefghijklmnopqrstuvwxyz';
	const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));
	
	return (length = 24) => Array.from({length}, () => heyStack[randomInt()]).join('');
})();

const getFilePath = (fileName, fileId) => `./uploads/file-${fileId}-${fileName}`;

app.use(express.json());
app.use(cors());

app.post('/upload-request', (req, res) => {
	if (!req.body || !req.body.fileName) {
		res.status(400).json({message: 'Missing "fileName"'});
	} else {
		const fileId = uniqueAlphaNumericId();
		fs.createWriteStream(getFilePath(req.body.fileName, fileId), {flags: 'w'});
		res.status(200).json({fileId});
	}
});

app.get('/upload-status', (req, res) => {
	if(req.query && req.query.fileName && req.query.fileId) {
		getFileDetails(getFilePath(req.query.fileName, req.query.fileId))
			.then((stats) => {
				res.status(200).json({totalChunkUploaded: stats.size});
			})
			.catch(err => {
				console.error('failed to read file', err);
				res.status(400).json({message: 'No file with such credentials', credentials: req.query});
			});
	}
});

app.post('/upload', (req, res) => {
	const contentRange = req.headers['content-range'];
	const fileId = req.headers['x-file-id'];
	
	if (!contentRange) {
		console.log('Missing Content-Range');
		return res.status(400).json({message: 'Missing "Content-Range" header'});
	}
	
	if(!fileId) {
		console.log('Missing File Id');
		return res.status(400).json({message: 'Missing "X-File-Id" header'});
	}
	
	const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
	
	if(!match) {
		console.log('Invalid Content-Range Format');
		return res.status(400).json({message: 'Invalid "Content-Range" Format'});
	}
	
	const rangeStart = Number(match[1]);
	const rangeEnd = Number(match[2]);
	const fileSize = Number(match[3]);
	
	if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
		return res.status(400).json({message: 'Invalid "Content-Range" provided'});
	}
	
	const busboy = new Busboy({ headers: req.headers });
	
	busboy.on('file', (_, file, fileName) => {
		const filePath = getFilePath(fileName, fileId);
		if (!fileId) {
			req.pause();
		}
		
		getFileDetails(filePath)
			.then((stats) => {
				
				if (stats.size !== rangeStart) {
					return res
						.status(400)
						.json({message: 'Bad "chunk" provided'});
				}
				
				file
					.pipe(fs.createWriteStream(filePath, {flags: 'a'}))
					.on('error', (e) => {
						console.error('failed upload', e);
						res.sendStatus(500);
					});
			})
			.catch(err => {
				console.log('No File Match', err);
				res.status(400).json({message: 'No file with such credentials', credentials: req.query});
			})
	});
	
	busboy.on('error', (e) => {
		console.error('failed upload', e);
		res.sendStatus(500);
	})
	
	busboy.on('finish', () => {
		res.sendStatus(200);
	});
	
	req.pipe(busboy);
});

app.listen(1234);
console.log('listening on port 1234');
