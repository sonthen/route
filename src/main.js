//  @flow
// import pipe from './Pipe';
import http from 'http';
import path from 'path';
import fs from 'fs';
import url from 'url';

import Router from './Router';

let supportedType = {
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  txt: 'plain/text',
};
let server = http.createServer();
let router = new Router();

function serveNotFoundPage(request: Object, response: Object) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/html');
  response.end(`<h1>Bad Request !</h1>`);
}
function serveErrorPage(request: Object, response: Object, error: Error) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/html');
  response.end(`<h1>${error.toString()}</h1>`);
}
function serveAsset(request: Object, response: Object, filePath: string) {
  let readStream = fs.createReadStream(filePath);

  readStream.on('error', (error: Error) => {
    serveErrorPage(request, response, error);
  });

  // response.statusCode = 200;
  // response.setHeader('Content-Type', 'video/mp4');
  readStream.pipe(response);

  readStream.on('end', () => {
    console.log('serving done!');
    response.end();
  });
}

router.addRoute('/', ({request, response}) => {
  let fileHTML = path.join(__dirname, 'index.html');
  serveAsset(request, response, fileHTML);
});

router.addRoute('/assets/:fileName', ({request, response}, fileName) => {
  let fileExtension = fileName.split('.').pop();
  if (supportedType[fileExtension]) {
    response.statusCode = 200;
    let fileType = supportedType[fileExtension].split('/')[0];
    response.setHeader('Content-Type', supportedType[fileExtension]);
    let filePath = path.join(__dirname, '../assets', fileType, fileName);

    serveAsset(request, response, filePath);
  } else {
    serveNotFoundPage(request, response);
  }
});

router.addRoute('/notFound', ({request, response}) => {
  serveNotFoundPage(request, response);
});

router.addRoute('/submit-json', ({request, response}) => {
  let chunks = [];
  request.on('data', (chunk) => {
    chunks.push(chunk);
  });

  let data;
  request.on('end', () => {
    data = Buffer.concat(chunks).toString();
    console.log('chunk!@@!', JSON.parse(data));
    response.end();
  });
});

server.on('request', (request, response) => {
  router.handleRequest(request.url, {request, response});
});

server.listen(8000);

// if (request.url.startsWith('/upload/')) {
//   console.log('METHOD !', request.method);
//   let preFileName = request.url.split('/').pop();
//   let fileName = preFileName.split('.')[0];
//   let dummyVal = url.parse(request.url, true).query.value;
//   console.log('here!!!', dummyVal);
//   let filePath = path.join(__dirname, '../assets', fileName);
//   let writeStreams = fs.createWriteStream(filePath);
//   writeStreams.write(dummyVal, () => {
//     response.end();
//   });
// }
