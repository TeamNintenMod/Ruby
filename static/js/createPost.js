const { post } = require("../../routes/pages");

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
    const communityid = document.getElementById('community_input').value.toString()

    console.log(communityid)

    fetch('http://olv.nonamegiven.xyz/v1/communities/post', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'body': postContent,
            'communityid' : communityid
        }
    }).then((response) => {
        switch(response.status) {

            case 200:
                window.location.href = "http://olv.nonamegiven.xyz"
            default:
                console.log("Sorry, your token has changed. Please resign in.")

        }
    })
}