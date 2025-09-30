const prompt = require('prompt-sync')()
const business = require('./business')

/**
 * format date into a readable form
 * @param {string} rawDate - raw date string 
 * @returns {string} - formatted data
 */
function formatDate(rawDate){
    try{
        return new Date(rawDate).toLocaleDateString("en-US",{
            year: "numeric", month:"long",day:"numeric"
        })
    } catch (e){
        return String(rawDate)
    }
}

/**
 * find and display a photos details if owned by user 
 * @param {{id:number}} user - the logged in user
 * @returns {promise<void>}
 */
async function menuFindPhoto(user){
    let pid = Number(prompt('Photo ID? '))
    let p = await business.getPhotoDetailSecure(pid,user)
    if(!p){
        console.log('Photo not found or is not yours')
        return
    }
    let albums = await business.getAlbumNamesById(p.albums)
    let albumNames = ''
    for(let name of albums){
        if (albumNames.length > 0){
            albumNames+=', '
        }
        albumNames+=name
    }
    let tagsString = ''
    for (let t of p.tags){
        if(tagsString.length > 0){
            tagsString+=', '
        }
        tagsString+=t
    }
    console.log(
        'Filename: '+p.filename +'\n'+
        'Title: '+p.title +'\n'+
        'Date: '+formatDate(p.date) +'\n'+
        'Albums: '+albumNames +'\n'+
        'Tags: '+tagsString
    )
}
/**
 * update a photos title and description if owned by the user
 * @param {{id:number}} user - the logged in user 
 * @returns {promise<void>}
 */
async function menuUpdatePhoto(user) {
    let pid = Number(prompt('Photo ID? '))
    let p = await business.getPhotoDetailSecure(pid,user)
    if(!p){
        console.log('Photo not found or is not yours')
        return
    }
    let title = prompt('Enter value for title ['+p.title+']: ')
    let desc = prompt('Enter value for description ['+p.description+']: ') 
    let ok = await business.updatePhotoSecure(pid,title,desc,user)
    if(ok){
        console.log('Photo Updated!')
    }
    else{
        console.log('Update Failed')
    }          
}
/**
 * show all photos in an album that belong to the user
 * @param {{id:number}} user - the logged in user
 * @returns {promise<void>}
 */
async function menuAlbumPhotos(user) {
    let name = prompt('Album name? ')
    let albumId = await business.findAlbumIdByName(name)
    if (albumId === null){
        console.log('Album not found')
        return
    }
    let list = await business.getUserPhotosInAlbum(albumId, user)
    console.log('filename, resolution, tags')
    for(let p of list){
        let tagsJoined=''
        for(let t of p.tags){
            if(tagsJoined.length>0){
                tagsJoined+=':'
            }
            tagsJoined+=t
        }
        console.log(p.filename+', '+p.resolution+', '+tagsJoined)

    }  
}
/**
 * add a tag to a photo owned by a user
 * @param {{id:number}} user - the logged in user
 * @returns {promise<void>}
 */
async function menuTagPhoto(user) {
    let pid = Number(prompt('Photo ID? '))
    let p = await business.getPhotoDetailSecure(pid,user)
    if(!p){
        console.log('Photo not found or is not yours')
        return
    }
    let current = ''
    for (let t of p.tags){
        if(current.length>0){
            current+=', '
        }
        current+=t
    }
    let t = prompt('Tag to add ('+current+'): ')
    let ok = await business.addTagSecure(pid,t,user)
    if(ok){
        console.log('Updated!')
    }
    else{
        console.log('Update failed')
    }
    
}
/**
 * the main entry point, login feature and shows the interactive menu
 * @returns {promise<void>}
 */
async function run() {
    console.log('== Login ==')
    let user = await business.login(prompt('Username: '), prompt('Password: '))
    if(!user){
        console.log('invalid credentials')
        return
    }
    while(true){
        console.log('1. Find Photo')
        console.log('2. Update Photo Details')
        console.log('3. Album Photo List')
        console.log('4. Tag Photo')
        console.log('5. Exit')
        let choice = Number(prompt('> '))

        if (choice===1){
            await menuFindPhoto(user)
        }
        else if (choice===2){
            await menuUpdatePhoto(user)
        }
        else if (choice===3){
            await menuAlbumPhotos(user)
        }
        else if (choice===4){
            await menuTagPhoto(user)
        }
        else if (choice===5){
            break
        }
        else{
            console.log('invalid selection')
            continue
        }
    }
    
}
run()