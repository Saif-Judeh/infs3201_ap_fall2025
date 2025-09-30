const fs = require('fs/promises')

const USER_PATH = 'data/users.json'
const PHOTO_PATH = 'data/photos.json'
const ALBUM_PATH = 'data/albums.json'

/**
 * read and parse a JSON file
 * @param {string} path - path to JSON file
 * @returns {promise<any>} - parsed JSON content
 */
async function readJson(path){
    let raw = await fs.readFile(path, 'utf-8')
    return JSON.parse(raw)
}
/**write data to a JSON file
 * 
 * @param {string} path - path to JSON file 
 * @param {any} data - data to write
 */
async function writeJson(path,data){
    await fs.writeFile(path, JSON.stringify(data,null,2),'utf-8')
}
/**
 * get all users from storage
 * @returns @returns {promise<object>} - array of user objects
 */
async function getAllUsers(){
    return readJson(USER_PATH)
    }
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
 * save all photos to storage
 * @param {object[]} list - list of photo objects
 * @returns {promise<void>}
 */
async function saveAllPhotos(list) {
    return writeJson(PHOTO_PATH,list)
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
    getAllUsers,
    getAllPhotos,
    getAllAlbums,
    saveAllPhotos,
    findPhotoById,
    updatePhoto
}