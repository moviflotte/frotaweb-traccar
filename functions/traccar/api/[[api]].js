export const onRequest = ({request, env}, cf) => {
    const url = new URL(request.url)
    url.host = env.TRACCAR_SERVER || 'gps.frotaweb.com'
    url.protocol = 'http:'
    url.port = 80
    url.pathname = request.url.pathname.replace('/traccar', '/')
    return fetch(new Request(url, request), cf)
}
