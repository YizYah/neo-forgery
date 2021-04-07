const fullName = require('fullname')
const gitUserName = require('git-user-name');
const path = require('path')

module.exports = {
    init: async function(command: string, codeDir: string){
        const defaultProjectName = path.basename(codeDir)
        const session = {
            notWin: process.platform !== "win32",
            userName: gitUserName(),
            fullName: fullName(),
            defaultProjectName,
            year: new Date().getFullYear(),
        }

        return session

    },

}
