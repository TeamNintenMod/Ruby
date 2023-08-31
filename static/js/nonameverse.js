function endLoading() {
    wiiuBrowser.endStartUp();
    wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
    setTimeout(function() {
        wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
    },90000);
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

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            window.location.replace("/titles/show")
        }
    }
}

function submitPost(title_id) {
    var xhr = new XMLHttpRequest();

    var content = document.getElementById("bodyInput").value

    var json = '{ "body" : "'+content+'", "title_id" : '+title_id+', "feeling_id" : 0, "is_spoiler" : 0 }'

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/?applet=1")
    xhr.setRequestHeader("BODY", json)

    xhr.send()

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log("Rec")
            window.location.replace("/titles/show") 
        }
    }
}

function Yeah(postId) {

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "https://olvportal.nonamegiven.xyz/v1/posts/"+postId+"/empathies")

    xhr.send()

    xhr.onload = function() {
        if (xhr.status == 200) {
            document.getElementById(postId + "_text").innerText = "Unyeah!"
            document.getElementById(postId).style.color = "#58a7db"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId).setAttribute( "onClick", "UnYeah("+postId+")")
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) + 1

            wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
        }
    }
}

function UnYeah(postId) {
    var xhr = new XMLHttpRequest();

    xhr.open("DELETE", "https://olvportal.nonamegiven.xyz/v1/posts/"+postId+"/empathies")

    xhr.send()

    xhr.onload = function() {
        if (xhr.status == 200) {
            document.getElementById(postId + "_text").innerText = "Yeah!"
            document.getElementById(postId).style.color = "grey"
            document.getElementById(postId + "_symbol").innerText = "E"
            document.getElementById(postId).setAttribute( "onClick", "Yeah("+postId+")")
            document.getElementById(postId + "_empathy_count").innerText = Number(document.getElementById(postId + "_empathy_count").innerText) - 1
        }
    }
}
