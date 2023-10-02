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

var account

function init_account_data(account_i) {
    account = JSON.parse(account_i)

    console.log("initialized account for " + account.name)
}

function init_post(post_id) {

    console.log("initializing post"+post_id)

    var xhr = new XMLHttpRequest()

    xhr.open("GET", "/v1/posts/"+post_id+"/empathies")

    xhr.send()

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log("got empathy for post "+post_id)
            var response = JSON.parse(xhr.responseText)
            var empathy_count = document.getElementById(post_id + "_empathy_count")

            empathy_count.innerText = response.length

            console.log(JSON.stringify(response).search(account.pid))

            if (JSON.stringify(response).search(account.pid) != -1) {
                document.getElementById(post_id + "_text").innerText = "Unyeah!"
                document.getElementById(post_id).style.color = "#58a7db"
                document.getElementById(post_id + "_symbol").innerText = "E"
            }
        } else if (xhr.readyState === 4 && xhr.status != 200) {
            console.log("failed to get empathy count for post "+post_id)
            var empathy_html = document.getElementById(post_id + "_empathy_count")
        }
    }
}

function sort_communities() {
    var ele = document.getElementById('community_sort_select')

    switch (ele.value) {
        case 'Popular':
            window.location.replace("/titles/show?sort=popular")
            break;
        case 'Newest':
            window.location.replace("/titles/show?sort=newest")
            break;
        case 'Oldest':
            window.location.replace("/titles/show?sort=oldest")
            break;
        default:
            window.location.replace("/titles/show?sort=popular")
            break;
    }
}

function submitUser() {
    var xhr = new XMLHttpRequest();

    var nnid = document.getElementById("nnidInput").value

    if (nnid) {
        xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/people")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.setRequestHeader("NNID", nnid)
    
        xhr.send()
        wiiuBrowser.lockUserOperation(true);
    
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 201) {
                window.location.replace("/setup/03")
            }
        }
    }
}

function Yeah(postId) {

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/" + postId + "/empathies")

    xhr.send()
    wiiuBrowser.lockUserOperation(true);

    xhr.onload = function () {
        if (xhr.status == 201) {
            wiiuBrowser.lockUserOperation(false);
            document.getElementById(postId + "_text").innerText = "Unyeah!"
            document.getElementById(postId).style.color = "#58a7db"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) + 1

            wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
        } else if (xhr.status == 200) {
            wiiuBrowser.lockUserOperation(false);
            document.getElementById(postId + "_text").innerText = "Yeah!"
            document.getElementById(postId).style.color = "grey"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) - 1
        } else {
            wiiuBrowser.lockUserOperation(false);
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
        form.append('screenshot', wiiuMainApplication.getScreenShot(true))
    }

    form.append('feeling_id', '0')
    form.append('language_id', '0')
    form.append('is_spoiler', '0')
    form.append('is_autopost', '0')
    form.append('is_app_jumpable', '1')
    form.append('community_id', community_id.toString())
    form.append('app_data', '')

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/")

    if (isPosting == 0) {
        xhr.send(form)
        isPosting = 1

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log("Rec")
                window.location.href = "/posts/" + JSON.parse(xhr.responseText).post_id
            }
        }
    }


}

function getScreenshot() {
    var ssview = document.getElementById('postUI_screenshot')

    ssview.src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(true)
}

function favorite_community(id) {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/communities/"+id+"/favorite")

    xhr.send()

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                document.getElementById("favorite_button_"+id).style.color = "#F7A642"
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            } else if (xhr.status === 200) {
                document.getElementById("favorite_button_"+id).style.color = "grey"
                wiiuSound.playSoundByName('SE_WAVE_MII_CANCEL', 1);
            }
            
        }
    }
}

function show_spoiler(id) {
    document.getElementById("post_"+String(id)).style.display = 'inline-block'
    document.getElementById('spoiler_button_'+String(id)).style.display = 'none'
    document.getElementById("screen_name_"+String(id)).style.right = '15px'
    document.getElementById("screen_name_"+String(id)).style.bottom = '8px'
}

function load_more_posts(community_id) {
    var posts_container = document.getElementById('posts_container')

    var offset = posts_container.children.length - 1

    console.log(offset)

    var xhr = new XMLHttpRequest()

    xhr.open("GET", "/v1/communities/"+community_id+"/loadmoreposts?offset="+offset)
    xhr.send()

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = xhr.responseText
            var more_posts = document.getElementById('more_posts_button')

            more_posts.style.display = 'none'
            posts_container.innerHTML += response
        }
    }
}
