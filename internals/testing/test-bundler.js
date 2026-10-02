/**
 * Required by the jest unit testing module
 */

import 'core-js/stable';
// eslint-disable-next-line import/no-nodejs-modules
import { TextEncoder, TextDecoder } from 'util';

// jsdom does not provide TextEncoder/TextDecoder, but some dependencies
// (e.g. @solana/web3.js) expect them at import time
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// setupStore() installs a console-logging middleware outside production
// (console.group -> info/log -> groupEnd per dispatch). Swallow output emitted
// inside those groups so test output stays readable.
/* eslint-disable no-console */
let loggerGroupDepth = 0;
console.group = () => {
  loggerGroupDepth += 1;
};
console.groupEnd = () => {
  loggerGroupDepth = Math.max(0, loggerGroupDepth - 1);
};
['info', 'log'].forEach((method) => {
  const original = console[method];
  console[method] = (...args) => {
    if (loggerGroupDepth === 0) original(...args);
  };
});
/* eslint-enable no-console */
