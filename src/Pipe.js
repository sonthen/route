//  @flow

export default function pipe(readStream, writeStream) {
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
