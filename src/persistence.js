const fs = require('fs/promises')

const USER_PATH = 'data/users.json'
const PHOTO_PATH = 'data/photos.json'
const ALBUM_PATH = 'data/albums.json'

async function readJson(path){
    let raw = await fs.readFile(path, 'utf-8')
    return JSON.parse(raw)
}

async function writeJson(path,data){
    await fs.writeFile(path, JSON.stringify(data,null,2),'utf-8')
}

async function getAllUsers(){
    return readJson(USER_PATH)
    }
async function getAllPhotos(){
    return readJson(PHOTO_PATH)
}
async function getAllAlbums(){
    return readJson(ALBUM_PATH)
}
async function saveAllPhotos(list) {
    return writeJson(PHOTO_PATH,list)
}

async function findPhotoById(id){
    let list = await getAllPhotos
    for (let p of list){
        if (p.id === id){
            return p
        }
        else{
            return undefined
        }
    }
}

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