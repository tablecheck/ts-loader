export default function xhrPromise(
  url,
  { responseType = 'arraybuffer', progress = () => {} } = {}
) {
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.status !== 200) {
        return reject(new Error(`xhr status: ${xhr.status}, url: ${url}`));
      }

      return resolve({
        response: responseType === 'text' ? xhr.responseText : xhr.response,
        contentType: xhr.getResponseHeader('Content-Type')
      });
    };

    xhr.onerror = () => {
      return reject(new Error(`xhr failed: ${url}`));
    };

    xhr.ontimeout = () => {
      return reject(new Error(`xhr timeout: ${url}`));
    };

    xhr.onabort = () => {
      return reject(new Error(`xhr abort: ${url}`));
    };

    xhr.addEventListener('progress', progress);

    xhr.open('GET', url, true);

    // For IE, set the responseType after open.
    xhr.responseType = responseType;

    xhr.send();
  });
}
