const db = require('./persistence')

async function login(username, password){
    let users = await db.getAllUsers()
    for(let u of users){
        if(u.username === username && u.password === password){
            return { id: u.id, username:u.username }
        }
    }
    return null
}

async function getPhotoDetailSecure(pid,user){
    let p = await db.findPhotoById(pid)
    if (!p){
        return null
    }
    if(p.owner !== user.id){
        return null
    }
    return p
}

async function updatePhotoSecure(pid, title, description, user){
    let p = await getPhotoDetailSecure(pid,user)
    if(!p){
        return false
    }
    p.title = title
    p.description = description
    return db.updatePhoto(p)
}

async function addTagSecure(pid,tag,user) {
    let p = await getPhotoDetailSecure(pid,user)
    if(!p){
        return false
    }
    let t = String(tag).toLowerCase()
    if(t.length === 0){
        return false
    }
    let exists = false
    for (let existing of p.tags){
        if (existing === t){
            exists = true
            break
        }
    }
    if(!exists){
            p.tags.push(t)
    }
    return db.updatePhoto(p)
}

async function getUserPhotosInAlbum(albumId,user){
    let list = await db.getAllPhotos()
    let out =[]
    for(let p of list){
        if(p.owner === user.id){
            for(let a of p.albums){
                if(a === albumId){
                    out.push(p)
                    break
                }
            }
        }
    }
    return out
}
module.exports = {
    login,
    getPhotoDetailSecure,
    updatePhotoSecure,
    addTagSecure,
    getUserPhotosInAlbum
}