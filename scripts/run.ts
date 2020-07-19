import bundle from '../src/bundle';
import readline from 'readline';
import zlib from 'zlib';
import fs from 'fs';
// @ts-ignore
// import zlibBrowser from 'zlib-browserify';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const rawCode = await new Promise<string>(async (resolve) => {
    let result = '';

    console.log('Paste code:');

    rl.prompt();

    let ackFirstLine!: () => void;
    const gotFirstLine = new Promise((r) => (ackFirstLine = r));

    rl.addListener('line', (line) => {
      ackFirstLine();
      result += `${line}\n`;
    });

    await gotFirstLine;
    await new Promise((r) => setTimeout(r, 500));
    rl.close();
    resolve(result);
  });

  await fs.promises.writeFile('./test.ts', rawCode);

  const code = bundle(rawCode);
  console.log('Minified output:');
  console.log(code);
  console.log('');

  function getByteLengthStr(buffer: Buffer) {
    const byteLength = buffer.byteLength;

    if (byteLength < 1000) {
      return `${byteLength}B`;
    }

    return `${(byteLength / 1000).toFixed(2)}kB`;
  }

  const minified = Buffer.from(code);
  const gzipped = await new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(minified, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });

  console.log('==============');
  console.log(`minified: ${getByteLengthStr(minified)}`);
  console.log(`gzipped: ${getByteLengthStr(gzipped)}`);
  console.log('==============');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

