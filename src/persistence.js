const mongodb = require('mongodb')


let client 
let db
let albumCollection 
let photoCollection

/**
 * establish and cache a connection to the MongoDB database 
 * creates global handles for the album and photo collection 
 * 
 * @returns {promise<void>}
 */
async function connectDatabase(){
    if (!client){
        client = new mongodb.MongoClient('mongodb+srv://60306539_db_user:12class34@infs3201.amrmeux.mongodb.net/?retryWrites=true&w=majority&appName=INFS3201')
        await client.connect()
        db = client.db('infs3201_fall2025')
        albumCollection = db.collection('albums')
        photoCollection = db.collection('photos')
    }
}

/**
 * get all photos from database
 * @returns {promise<object[]>} - array of photo objects
 */
async function getAllPhotos(){
    await connectDatabase()
    let result = photoCollection.find()
    let data = await result.toArray()
    return data
}

/**
 * get all albums from storage
 * @returns {promise<object[]>} - array of album objects
 */
async function getAllAlbums(){
    await connectDatabase()
    let result = albumCollection.find()
    let data = await result.toArray()
    return data
}


/**
 * find a photo by its ID
 * @param {number} id - Photo ID.
 * @returns {promise<object | undefined>} - photo object if found, else undefined.
 */
async function findPhotoById(id){
    await connectDatabase()
    let result = await photoCollection.findOne({id:Number(id)})
    return result
}
/**
 * update an existing photo in storage
 * @param {number} id - the photo id
 * @param {string} title - new title text
 * @param {string} desc - new description text
 * @returns {promise<boolean>} - true if updated, otherwise false
 */
async function updatePhoto(id, title, desc){
    await connectDatabase()
    let result = await photoCollection.updateOne(
        {id:Number(id)},
        {$set: {title: title, description: desc}}
    )
    return res.matchedCount === 1

}

module.exports = {
    getAllPhotos,
    getAllAlbums,
    findPhotoById,
    updatePhoto
}