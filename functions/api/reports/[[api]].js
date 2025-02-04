export const onRequest = ({request, env}, cf) => {
    const url = new URL(request.url)
    console.log('reports')
    console.log(request.url)
    url.host = 'kt24ptntaq46xbiqh5acvawdge0fdjzu.lambda-url.us-east-1.on.aws'
    return fetch(new Request(url, request), cf)
}
