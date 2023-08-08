function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
    }
}
    return "";
}

function Post() {
    const postContent = document.getElementById('postInput').value;

    const nnid = getCookie('nnid')
    const password = getCookie('password')
    const token = getCookie('token')

    console.log(document.cookie)

    fetch('http://192.168.1.49:80/api/post/post', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'nnid': nnid,
            'content': postContent
        }
    }).then((response) => {
        switch(response.status) {

            case 200:
                window.location.href = "http://192.168.1.49:80/pages/home"
            default:
                console.log("LMAO IT BROKE")

        }
    })
}