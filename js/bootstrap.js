// build-marker URL bump (cache-bust query)
// Original: index.html script_02.js

try {
    var u = new URL(location.href);
    if (!u.searchParams.has('_yt')) {
      var marker = 'yt_build_seen_'+ 't202604241600';
      if (!sessionStorage.getItem(marker)) {
        sessionStorage.setItem(marker, '1');
        u.searchParams.set('_yt', 't202604241340');
        location.replace(u.toString());
        // navigation begins; remaining work is moot
      }
    }
  } catch(e){}
export function setup() {
  if (typeof init === 'function') init();
}
