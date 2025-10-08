const mongo = require('mongodb')




/**
 * get all photos from storage
 * @returns 
 */
async function getAllPhotos(){
    return readJson(PHOTO_PATH)
}
/**
 * get all albums from storage
 * @returns {promise<object[]>} - array of album objects
 */
async function getAllAlbums(){
    return readJson(ALBUM_PATH)
}


/**
 * find a photo by its ID
 * @param {number} id - Photo ID.
 * @returns {promise<object | undefined>} - photo object if found, else undefined.
 */
async function findPhotoById(id){
    let list = await getAllPhotos()
    for (let p of list){
        if (p.id === id){
            return p
        }
    }
    return undefined
}
/**
 * update an existing photo in storage
 * @param {object} updated - updated photo object
 * @returns {promise<boolean>} - true if updated, otherwise false
 */
async function updatePhoto(updated){
    let list = await getAllPhotos()
    let found = false
    let index = 0 
    for (let p of list){
        if(p.id === updated.id){
            list[index] = updated
            found = true
            break
        }
        index++
    }
    if(!found){
        return false
    }
    await saveAllPhotos(list)
    return true
}

module.exports = {
    getAllPhotos,
    getAllAlbums,
    findPhotoById,
    updatePhoto
}