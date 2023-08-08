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

//Sign In and Sign Up
function signIn() {

    console.log("Sending Fetch Request..")
    const nnid = document.getElementById('nnidField').value
    const password = document.getElementById('passwordField').value

    const token = fetch('http://192.168.1.49:80/api/account/accountsignin', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "nnid": nnid,
            "password": password
        }
    }).then(response => response.text()).then((token) => {
        console.log("WARNING!!! DO NOT SHARE YOUR TOKENS!!!!!")
        console.log(token)

        document.cookie = `token=${token}`
        document.cookie = `nnid=${nnid}`
        document.cookie = `password=${password}`
        
        window.location.href = "http://192.168.1.49:80/pages/home"
    })
} 

function accountCheck() {
    if (!getCookie('token').toString() == "") {
        window.location.replace("http://192.168.1.49:80/pages/home")
        console.log("DIE!!!")
    }
    
    console.log(getCookie('token').toString())
    console.log("Account Checked")
}