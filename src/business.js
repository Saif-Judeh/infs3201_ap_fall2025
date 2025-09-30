const db = require('./persistence')
/**
 * authenticate a user by username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {promise<{id: number, username: string} | null>}
 * returns the user as an object if the credentials match, otherwise returns null.
 */
async function login(username, password){
    let users = await db.getAllUsers()
    for(let u of users){
        if(u.username === username && u.password === password){
            return { id: u.id, username:u.username }
        }
    }
    return null
}

/**
 * securely fetch a photo if it belongs to the given user.
 * @param {number} pid - photo ID 
 * @param {{id:number}} user - the logged in user
 * @returns {promise<object | null>} - the photo object if found and owned by the user, if not then null.
 */
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
/**
 * update a photos information if it belongs to the user
 * @param {number} pid - photo id.
 * @param {string} title - new title.
 * @param {string} description - new description.
 * @param {{id: number}} user - the logged in user.
 * @returns {promise<boolean>} - true if updated, if not then false.
 */
async function updatePhotoSecure(pid, title, description, user){
    let p = await getPhotoDetailSecure(pid,user)
    if(!p){
        return false
    }
    p.title = title
    p.description = description
    return db.updatePhoto(p)
}

/**
 * add a tag to a photo if it belongs to the user and doesnt already exist. 
 * @param {number} pid - photo id. 
 * @param {string} tag - tag to add.
 * @param {{id:number}} user - the logged in user.
 * @returns {promise<boolean>} - returns true if tags added or already exists, false if not allowed.
 */
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

/**
 * get all photos in a specific album that belong to a user.
 * @param {number} albumId - album id.
 * @param {{id:number}} user - the logged in user.
 * @returns {promise<object[]>} array of photo objects owned by user in the album.
 */
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
/**
 * convert an array of album ids into their album names
 * @param {number[]} ids - array of album ID's. 
 * @returns {promise<string[]>} - array of album names.
 */
async function getAlbumNamesById(ids){
    let albums = await db.getAllAlbums()
    let names = []
    for (let wantedId of ids){
        for(let a of albums){
            if(a.id===wantedId){
                names.push(a.name)
                break
            }
        }
    }
    return names
}
/**
 * find an album id by name
 * @param {stirng} name - album name. 
 * @returns {promise<number | null>} - the album id if found, else null.
 */
async function findAlbumIdByName(name) {
    let albums = await db.getAllAlbums()
    let target = name.toLowerCase()
    for(let a of albums){
        if(a.name.toLowerCase()===target){
            return a.id
        }
    }
    return null
}
module.exports = {
    login,
    getPhotoDetailSecure,
    updatePhotoSecure,
    addTagSecure,
    getUserPhotosInAlbum,
    getAlbumNamesById,
    findAlbumIdByName
}