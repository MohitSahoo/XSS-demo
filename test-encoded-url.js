// Test URL decoding
const testUrl = "http://localhost:3000/dom#%3Cimg%20src=x%20onerror=%22alert('Image%20XSS')%22%3E";
const url = new URL(testUrl);
const hash = url.hash.slice(1);
const decoded = decodeURIComponent(hash);

console.log('Original URL:', testUrl);
console.log('Hash:', hash);
console.log('Decoded:', decoded);
console.log('Expected:', '<img src=x onerror="alert(\'Image XSS\')">');
console.log('Match:', decoded === '<img src=x onerror="alert(\'Image XSS\')">');