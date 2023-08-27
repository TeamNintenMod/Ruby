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
