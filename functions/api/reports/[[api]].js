export const onRequest = ({request, env}, cf) => {
    const url = new URL(request.url)
    url.host = 'ltqgfyvcklxzaonv7h4rlmghai0rszop.lambda-url.us-east-1.on.aws'
    return fetch(new Request(url, request), cf)
}
