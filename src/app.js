const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const bs = require('./business')
const port = 8000


const app = express()

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout:'main',
    layoutsDir: path.join(__dirname,'..','views','layouts')
}))

app.set('view engine','hbs')
app.set('views', path.join(__dirname, '..', 'views'))

app.use('/public', express.static(path.join(__dirname,'..','public')))

app.use(express.urlencoded({extended:false}))

app.get('/', async function(req,res){
    let albums = await bs.getAllAlbums()
    res.render('index', {albums})
})

app.get('/album/:id', async (req,res)=>{
    let albumId = Number(req.params.id)
    let photos = await bs.getPhotosInAlbum(albumId)
    let allAlbums = await bs.getAllAlbums()
    let albumName = "Unknown Album"
    for(let a of allAlbums){
        if(a.id === albumId){
            albumName = a.name
            break
        }
    }
    let count = photos.length
    let countWord = count  === 1 ? 'photo' : 'photos'
    if(count === 0){
        let msg = "album not found or has no photos"
        return res.render('error',{msg, layout: undefined})
    }
    res.render('album',{albumId, albumName, photos, count, countWord})
})

app.get('/edit/:id', async (req,res)=> {
    let pid = Number(req.params.id)
    let photo = await bs.getPhotoById(pid)
    if(!photo){
        let msg = 'Photo not found'
        return res.render('error',{msg,layout:undefined})
    }
    res.render('editpicture',{photo : photo})
})


app.get('/photo/:id', async function (req,res) {
    let pid = Number(req.params.id)
    let photo = await bs.getPhotoById(pid)
    if(!photo){
        let msg = 'photo not found'
        return res.render('error', {msg:msg, layout:undefined})
    }
    res.render('photo', {photo:photo, maxSize:300})

})
app.post('/edit/:id', async(req,res)=>{
    let pid = Number(req.params.id)
    let title = req.body.title
    let description = req.body.description
    let ok = await bs.updatePhoto(pid,title,description)
    if(!ok){
        let msg = "failed to update photo"
        return res.render('error',{msg, layout:undefined})

    }
    res.redirect('/photo/'+pid)
})

app.use((req,res)=>{
    let msg = "page not found"
    res.status(404).render('error',{msg, layout:undefined})
})

app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
})
