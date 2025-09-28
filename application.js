const prompt = require('prompt-sync')()
const fs = require('fs/promises')

const PHOTO_FILE = 'photos.json'

/**
 * This function loads the json data from the file and returns it as an array of
 * photo objects.
 * @returns An array of photo objects
 */
async function loadPhotoData() {
    let raw = await fs.readFile(PHOTO_FILE, 'utf-8')
    let decoded = await JSON.parse(raw)
    return decoded
}

/**
 * Load the information about the albums into memory.
 * @returns An array of photo objects.
 */
async function loadAlbumData() {
    let raw = await fs.readFile('albums.json')
    let decoded = await JSON.parse(raw)
    return decoded
}

/**
 * Save the data to the JSON file.
 * @param {Array of json objects} data 
 */
async function savePhotoData(data) {
    let dataString = JSON.stringify(data, null, 2)
    await fs.writeFile(PHOTO_FILE, dataString, 'utf-8')
}

/**
 * Find details about an album given the albumId
 * @param {*} albumId The ID to search for.
 * @returns An object with the information or undefined if the album was not found.
 */
async function getAlbumDetails(albumId) {
    let albumList = await loadAlbumData()
    for (let a of albumList) {
        if (a.id === albumId) {
            return a
        }
    }
    return undefined
}

/**
 * Find an album given its name.
 * @param {*} name The name of the album, ignoring the case
 * @returns The album or undefined if it was not found.
 */
async function getAlbumDetailsByName(name) {
    let albumList = await loadAlbumData()
    for (let a of albumList) {
        if (a.name.toLowerCase() === name.toLowerCase()) {
            return a
        }
    }
    return undefined
}

/**
 * Get details about a photo given its ID
 * @param {*} photoId 
 * @returns An object if the photos is found or undefined if itwas not found.
 */
async function getPhotoDetails(photoId) {
    let photoList = await loadPhotoData()
    for (let p of photoList) {
        if (p.id === photoId) {
            return p
        }
    }
    return undefined
}

/**
 * Get an array of photos in the given album.
 * @param {*} albumId 
 * @returns A list of photos. If no photos (or album) are found then the function returns
 * an empty array.
 */
async function getPhotosInAlbum(albumId) {
    let result = []
    let photoList = await loadPhotoData()
    for (let p of photoList) {
        if (p.albums.includes(albumId)) {
            result.push(p)
        }
    }
    return result
}

/**
 * Convert the date format into a standard reading format for display.
 * @param {*} iso ISO date format
 * @returns English description of the date
 */
function formatDate(iso) {
    const date = new Date(iso)
    const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
    return formatted
}

/**
 * The function to interact with the user and to display the details of the photo.
 */
async function findPhoto() {
    console.log('\n\n')
    let pid = Number(prompt('Photo ID? '))
    let photoDetails = await getPhotoDetails(pid)
    if (photoDetails) {
        console.log(`Filename: ${photoDetails.filename}`)
        console.log(` Title: ${photoDetails.title}`)
        console.log(`  Date: ${formatDate(photoDetails.date)}`)
        albumList = []
        for (let aid of photoDetails.albums) {
            let ad = await getAlbumDetails(aid)
            if (ad) {
                albumList.push(ad.name)
            }
        }
        console.log(`Albums: ${albumList.join(', ')}`)
        console.log(`  Tags: ${photoDetails.tags.join(', ')}`)
    }
    else {
        console.log('!!! Photo not found')
    }
    console.log('\n\n')
}

/**
 * Displays a prompt asking what the new value should be. If the user just presses enter,
 * the original value will be returned.
 * @param {*} fieldName 
 * @param {*} previousValue 
 * @returns 
 */
function promptTitle(fieldName, previousValue) {
    let result = previousValue
    let newValue = prompt(`Enter value for ${fieldName} [${previousValue}]: `)
    if (newValue !== "") {
        result = newValue
    }
    return result
}

/**
 * Update a photo given its PID with the new title and description.
 * @param {*} pid 
 * @param {*} title 
 * @param {*} description 
 * @returns true if the photo was updated, false otherwise
 */
async function updatePhoto(pid, title, description) {
    let updated = false
    let photoList = await loadPhotoData()
    for (let p of photoList) {
        if (p.id === pid) {
            p.title = title
            p.description = description
            updated = true
        }
    }
    await savePhotoData(photoList)
    return updated
}

/**
 * Add the tag to an existing photo.  This function does no validation... if the caller adds
 * multiple copies of the same name the list would contain multiple occurrences of the tag.
 * @param {*} pid 
 * @param {*} tag 
 * @returns 
 */
async function addTag(pid, tag) {
    let updated = false
    let photoList = await loadPhotoData()
    for (let p of photoList) {
        if (p.id === pid) {
            p.tags.push(tag)
            updated = true
        }
    }
    await savePhotoData(photoList)
    return updated
}

/**
 * Interact with the user to update details about he title and description of the photo.
 */
async function updatePhotoDetails() {
    console.log('\n\n')
    let pid = Number(prompt('Photo ID? '))
    let photoDetails = await getPhotoDetails(pid)
    console.log("Press enter to reuse existing value.")
    let newTitle = promptTitle('title', photoDetails.title)
    let newDescription = promptTitle('description', photoDetails.description)
    let result = await updatePhoto(pid, newTitle, newDescription)
    if (result) {
        console.log("Photo updated")
    }
    else {
        console.log('!!! Problem updating')
    }
    console.log('\n\n')
}

/**
 * Interact wth the user to show the photos from an album in a CSV like format.
 * @returns 
 */
async function albumPhotos() {
    console.log('\n\n')
    let albumName = prompt('What is the name of the album? ')
    let albumDetails = await getAlbumDetailsByName(albumName)
    if (!albumDetails) {
        console.log('!!! Album not found\n\n')
        return
    }
    let photoList = await getPhotosInAlbum(albumDetails.id)
    console.log('filename,resolution,tags')
    for (let p of photoList) {
        console.log(`${p.filename},${p.resolution},${p.tags.join(':')}`)
    }
    console.log('\n\n')
}

/**
 * UI function to interact with the user to ask for the photo id and the tag to apply.
 * @returns 
 */
async function tagPhoto() {
    console.log('\n\n')
    let pid = Number(prompt("What photo ID to tag? "))
    let photoDetails = await getPhotoDetails(pid)
    if (!photoDetails) {
        console.log('!!!! Photo not found')
        return
    }
    let tag = prompt(`What tag to add (${photoDetails.tags.join(',')})? `).toLowerCase()
    if (!photoDetails.tags.includes(tag)) {
        await addTag(pid, tag)
        console.log('Updated!')
    }
    else {
        console.log("Ignoring request...photo already tagged")
    }
    console.log('\n\n')
}


/**
 * Function to display the menu and get a response from the user about what they 
 * want to do. If the user types an invalid selection the program will re-prompt them.
 * @returns The item selected.
 */
function getMenuSelection() {
    while (true) {
        console.log('1. Find Photo')
        console.log('2. Update Photo Details')
        console.log('3. Album Photo List')
        console.log('4. Tag Photo')
        console.log('5. Exit')
        let selection = Number(prompt('Your selection> '))
        if (Number.isNaN(selection) || selection < 0 || selection > 5) {
            console.log("**** ERROR **** select a valid option")
        }
        else {
            return selection
        }
    }
}

/**
 * The actual photo application.
 */
async function photoApplication() {
    while (true) {
        let choice = getMenuSelection()
        if (choice === 1) {
            await findPhoto()
        }
        else if (choice === 2) {
            await updatePhotoDetails()
        }
        else if (choice === 3) {
            await albumPhotos()
        }
        else if (choice === 4) {
            await tagPhoto()
        }
        else if (choice === 5) {
            break
        }
    }
}


photoApplication()