export const onRequest = ({request, env}, cf) => {
    const url = new URL(request.url.replace('/traccar/', '/'))
    const oldest = new Date().setDate(new Date().getDate() - parseInt(env.DATABASE_RETENTION_WEEKS || '3') * 7)
    const forward = url.searchParams.get('from') && new Date(url.searchParams.get('from')) < new Date(oldest)
    url.host =  forward?
        (env.TRACCAR_REPORTS_SERVER || 'aadobrygc6wsyawaleatkimjjm0cczwu.lambda-url.us-east-1.on.aws') :
        (env.TRACCAR_SERVER || 'gps.frotaweb.com')
    url.protocol = forward ? 'https:' : 'http:'
    url.port = forward ? 443 : 80
    console.log(url)
    return fetch(new Request(url, request), cf)
}
