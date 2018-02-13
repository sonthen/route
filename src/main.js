import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
let server = http.createServer();

// fs.readFile('./assets/img/goo.png', (err, data) => {
//   if (err) {
//     throw err;
//   }
//   console.log('data gambar !!', data);
// });

let dummyData = {
  Product: [
    {id: 1, name: 'banana', price: '100'},
    {id: 3, name: 'apple', price: '20000'},
    {id: 2, name: 'blackberry', price: '10'},
  ],
};

let supportedType = {
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  txt: 'plain/text',
};

function serveNotFoundPage(request, response) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/html');
  response.end(`<h1>Bad Request !</h1>`);
}
function serveErrorPage(request, response, error) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/html');
  response.end(`<h1>${error}</h1>`);
}
function serveAsset(request, response, filePath) {
  let readStream = fs.createReadStream(filePath);

  readStream.on('error', (error) => {
    serveErrorPage(request, response, error);
  });

  // response.statusCode = 200;
  // response.setHeader('Content-Type', 'video/mp4');
  readStream.pipe(response);

  readStream.on('end', () => {
    console.log('done!');
    response.end();
  });
}

function pipe(readStream, writeStream) {
  let chunkCount = 0;

  readStream.on('data', (data) => {
    if (chunkCount === 0) {
      writeStream.statusCode = 200;
      writeStream.setHeader('Content-Type', 'video/mp4');
    }
    console.log('chunkCount', chunkCount);

    chunkCount += 1;

    console.log(`Sending chunk ${chunkCount} @ ${data.length} bytes`);
    let shouldContinue = writeStream.write(data);
    if (shouldContinue === false) {
      console.log('pausing...');
      readStream.pause();
      writeStream.once('drain', () => {
        console.log('Drained..');
        readStream.resume();
      });
    }
  });
}

server.on('request', (request, response) => {
  console.log('request received', request.url);

  if (request.url.startsWith('/assets/')) {
    let fileName = request.url.split('/').pop();
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
  } else if (request.url.startsWith('/upload/')) {
    console.log('METHOD !', request.method);
    let preFileName = request.url.split('/').pop();
    let fileName = preFileName.split('.')[0];
    let dummyVal = url.parse(request.url, true).query.value;
    console.log('here!!!', dummyVal);

    // let fileName = 'upload';
    // let fileType = 'text';

    let filePath = path.join(__dirname, '../assets', fileName);
    // let dummyFilepath = path.join(__dirname, '../assets/image/image.png');
    // let readStream = fs.createReadStream(dummyFilepath);
    let writeStreams = fs.createWriteStream(filePath);
    // dummyVal.pipe(writeStreams);
    writeStreams.write(dummyVal, () => {
      response.end();
    });
    // writeStreams.on('end', () => {
    //   response.end();
    // });
  } else if (request.url === '/') {
    let fileHTML = path.join(__dirname, 'index.html');
    serveAsset(request, response, fileHTML);
  } else {
    serveNotFoundPage(request, response);
  }

  // if (request.url === '/') {
  //   response.statusCode = 200;
  //   response.setHeader('Content-Type', 'text/html');
  //   response.end('<h1>Hello !</h1>');
  // } else if (request.url === '/api/products') {
  //   response.statusCode = 200;
  //   response.setHeader('Content-Type', 'application/json');
  //   response.write(JSON.stringify(dummyData, null, 1));
  //   response.end();
  // } else if (request.url === '/api/video') {
  //   let filePath = './assets/video/BC4-Day4b.mp4';
  //   serveAsset(request, response, filePath);
  // } else if (request.url === '/api/img') {
  //   fs.readFile('./assets/img/goo.png', (error, data) => {
  //     if (error) {
  //       serveErrorPage(request, response, error);
  //       // throw err;
  //     } else {
  //       response.statusCode = 200;
  //       response.setHeader('Content-Type', 'image/png');
  //       response.end(data);
  //       // console.log('data gambar !!', data);
  //     }
  //   });
  // } else {
  //   serveNotFoundPage(request, response);
  // }
});

server.listen(8000);
