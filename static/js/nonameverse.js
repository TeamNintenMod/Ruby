function endLoading() {
    wiiuBrowser.endStartUp();
    wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
    setTimeout(function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
    }, 90000);
}

function newUser() {
    wiiuBrowser.endStartUp();
    wiiuSound.playSoundByName("BGM_OLV_INIT", 3);
}

function init_post(postId) {

    postId = postId + "_bottom_row"
    document.getElementById(postId).style.bottom = "0px"
    document.getElementById(postId).style.position = "absolute"
    document.getElementById(postId).style.width = "750px"
    document.getElementById(postId).style.marginBottom = "15px"
}



function submitUser() {
    var xhr = new XMLHttpRequest();

    var nnid = document.getElementById("nnidInput").value

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/people")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("NNID", nnid)

    xhr.send()
    wiiuBrowser.lockUserOperation(true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            window.location.replace("/titles/show")
        }
    }
}

function Yeah(postId) {

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/" + postId + "/empathies")

    xhr.send()

    xhr.onload = function () {
        if (xhr.status == 200) {
            document.getElementById(postId + "_text").innerText = "Unyeah!"
            document.getElementById(postId).style.color = "#58a7db"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId).setAttribute("onClick", "UnYeah(" + postId + ")")
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) + 1

            wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
        }
    }
}

function UnYeah(postId) {
    var xhr = new XMLHttpRequest();

    xhr.open("DELETE", "https://olvportal.nonamegiven.xyz/v1/posts/" + postId + "/empathies")

    xhr.send()

    xhr.onload = function () {
        if (xhr.status == 200) {
            document.getElementById(postId + "_text").innerText = "Yeah!"
            document.getElementById(postId).style.color = "grey"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId).setAttribute("onClick", "Yeah(" + postId + ")")
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) - 1
        }
    }
}

function postUIToggle() {
    var postUI = document.getElementById('postUI')

    if (postUI.style.display == 'none') {
        postUI.style.display = 'block'
    } else {
        postUI.style.display = 'none'
    }
}

var postMode = 0;
var isPosting = 0;

function postUI_text() {
    var input = document.getElementById('postUI_input')
    var drawing = document.getElementById('postUI_drawing')

    drawing.style.display = 'none'
    input.style.display = 'inline-block'

    postMode = 0
}

function postUI_img() {
    var input = document.getElementById('postUI_input')
    var drawing = document.getElementById('postUI_drawing')

    drawing.style.display = 'inline-block'
    input.style.display = 'none'

    wiiuMemo.open(false)
    drawing.src = 'data:image/png;base64,' + wiiuMemo.getImage(false)

    postMode = 1
}

function submitPost(community_id) {
    var xhr = new XMLHttpRequest();

    var content = document.getElementById("postUI_input").value
    var memo = wiiuMemo.getImage(true)
    var screenshot_img = document.getElementById('postUI_screenshot')

    var form = new FormData()

    switch (postMode) {
        case 0:
            form.append('body', content)
            break
        case 1:
            form.append('painting', memo)
            break
        default:
            console.log('Broken!!!!')
            break
    }

    if (!screenshot_img.src == "") {
        form.append('screenshot', wiiuMainApplication.getScreenShot(false))
    }

    form.append('feeling_id', '0')
    form.append('language_id', '0')
    form.append('is_spoiler', '0')
    form.append('is_autopost', '0')
    form.append('is_app_jumpable', '0')
    form.append('community_id', community_id.toString())

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/")

    if (isPosting == 0) {
        xhr.send(form)
        isPosting = 1

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log("Rec")
                window.location.replace("/titles/" + community_id)
            }
        }
    }


}

function getScreenshot() {
    var ssview = document.getElementById('postUI_screenshot')

    ssview.src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(false)
}
