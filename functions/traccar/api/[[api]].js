export const onRequest = ({request, env}, cf) => {
    const _url = request.url.replace('/traccar', '/')
    console.log(request.url, _url)
    const url = new URL(_url)
    url.host = env.TRACCAR_SERVER || 'gps.frotaweb.com'
    url.protocol = 'http:'
    url.port = 80
    return fetch(new Request(url, request), cf)
}
