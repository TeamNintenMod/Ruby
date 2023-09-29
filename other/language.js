const languages = require('../languages/index')

function getUserLanguage(account) {
    switch (account.language) {
        case "en":
            return languages.en
            break;
        case "es":
            return languages.es
            break;
        default:
            return languages.en
            break;
    }
}

function getSetupLanguage() {
    return languages.en
}

module.exports = {getUserLanguage, getSetupLanguage}