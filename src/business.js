const db = require('./persistence')

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
        for(let a of p.albums){
            if(a === albumId){
                out.push(p)
                break
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
    getUserPhotosInAlbum,
    getAlbumNamesById,
    findAlbumIdByName
}