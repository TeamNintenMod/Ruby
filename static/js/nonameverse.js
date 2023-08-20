
function endLoading() {
    wiiuBrowser.endStartUp();
    wiiuSound.playSoundByName('BGM_OLV_MAIN', 3);
    setTimeout(function() {
        wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
    },90000);
}