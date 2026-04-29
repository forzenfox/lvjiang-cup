import * as fs from 'fs';
import * as pathModule from 'path';

// Mock fs for exceljs writeFile in Jest environment
const _originalWriteFile = fs.writeFile;

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    createWriteStream: jest.fn((_path: string, _options?: any) => {
      // Return a mock write stream that works with exceljs
      const chunks: Buffer[] = [];
      const stream = {
        write: jest.fn((chunk: any) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        }),
        end: jest.fn((chunk?: any) => {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          // Write to actual file
          const data = Buffer.concat(chunks);
          actualFs.writeFileSync(_path, data);
          if (stream.onEnd) stream.onEnd();
        }),
        on: jest.fn((event: string, callback: any) => {
          if (event === 'finish') {
            stream.onEnd = callback;
          }
          if (event === 'error') {
            // No error
          }
        }),
        once: jest.fn(),
        emit: jest.fn(),
        destroy: jest.fn(),
        onEnd: null as any,
      };
      return stream;
    }),
  };
});
