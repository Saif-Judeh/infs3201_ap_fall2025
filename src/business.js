const db = require('./persistence')


/**
 * Gets all the albums from the database
 * @returns {promise<Object>} - an array of album documents
 */
async function getAllAlbums() {
    let albums = await db.getAllAlbums()
    return albums
}

/**
 * get all photos in a specific album that belong to a user.
 * @param {number} albumId - album id.
 * @param {{id:number}} user - the logged in user.
 * @returns {promise<object[]>} array of photo objects owned by user in the album.
 */
async function getPhotosInAlbum(albumId){
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
 * find an album id by name
 * @param {stirng} name - album name. 
 * @returns {promise<number | null>} - the album id if found, else null.
 */
async function getPhotoById(id) {
    let photo = await db.findPhotoById(Number(id))
    return photo

}

async function updatePhoto(id,title,desc) {
    let exists = await db.findPhotoById(Number(id))
    if(!exists){
        return false 
    }
    let ok = await db.updatePhoto(Number(id), title, desc)
    return ok
    
}
module.exports = {
    getPhotosInAlbum,
    getAllAlbums,
    getPhotoById,
    updatePhoto
}