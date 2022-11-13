let previewAudio = new Audio("");
const APIController = (function () {

    const clientId = '71c43d9898df4834804e81bc4b28889c';
    const clientSecret = 'b94dee24c7c448ce9e99dcae134d648a';
    
    //private methods

    const _getToken = async () =>{
        const result = await fetch('https://accounts.spotify.com/api/token',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ":" + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        console.log(data);
        return data.access_token;
    }

    const _getGenres = async (token) =>{

        const result = await fetch('https://api.spotify.com/v1/browse/categories',{
            method :'GET',
            headers : {'Authorization': 'Bearer ' + token}
        })

        const data = await result.json();
        // console.log(data.categories.items);
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 10;
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,{
            method: 'GET',
            headers : {'Authorization': 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) =>{

        const limit = 15;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`,{

            method:'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;

    }

    const _getTrack = async (token, trackEndPoint) =>{

        const result = await fetch(`${trackEndPoint}`,{
            method:'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }
    return {
        getToken(){
           
            return _getToken();
        },
        getGenres(token){
            return _getGenres(token);
        },
        getPlaylistByGenre(token,genreId){
            return _getPlaylistByGenre(token,genreId);
        },
        getTracks(token, tracksEndPoint){
            return _getTracks(token,tracksEndPoint);
        },
        getTrack(token, trackId){
            return _getTrack(token,trackId);
        }
    }
    
})();

const UIController = (function() {
    let token;
    const DOMElements ={
        selectGenre : '#select_genre',
        selectPlaylist : '#select_playlist',
        buttonSubmit : '#btn_submit',
        divSongDetail :'#song-detail',
        hfToken : '#hidden_token',
        divSonglist : '.song-list'
    }
    
    
    return{

        inputField() {
            return {
                genre : document.querySelector(DOMElements.selectGenre),
                playlist : document.querySelector(DOMElements.selectPlaylist),
                tracks : document.querySelector(DOMElements.divSonglist),
                submit : document.querySelector(DOMElements.buttonSubmit),
                songDetail : document.querySelector(DOMElements.divSongDetail)
                
            }
        },

       

        createGenre(text, value){
            // const html = `<option value="${value}">${text}</option>`;
            // document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend',html);
            // const button = `<a class="btn-nav" href="{{ url_for('home_bp.home') }}">${text}</a>`
            // console.log(button);
            // document.querySelector("#nav").insertAdjacentElement('beforeend', button);
        },
        
        createGenre(text, value) {
            // const html = `<option value="${value}">${text}</option>`;
            // document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
            const button = `<a class="btn-nav" href="#">${text}</a>`
            // console.log(button);
            document.querySelector('#nav').insertAdjacentHTML('beforeend', button);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },
        createTrack(id, name){
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        createTrackDetail(img, title, artist){
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = '';
            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">
            </div>
            <div class="row col-sm-12 px=0">
                <label for="Genre" class="form-label col-sm-12">${title}</label>
            </div>
            <div class="row col-sm-12 px-0">
            <label for="artist" class="form-label col-sm-12">${artist}</label>
            </div>
            `;
            detailDiv.insertAdjacentHTML('beforeend',html);
        },
        createAudio(preview_url){
            previewAudio = new Audio(preview_url);
            previewAudio.play();
        },
        resetTrackDetail(){
            this.inputField().songDetail.innerHTML = '';
        },
        resetTracks(){
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail()
        },
        resetPlaylist(){
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        storeToken(value){
            // token = value;
            document.querySelector(DOMElements.hfToken).value = value;
        },
        getStoredToken(){
            return{
                token : document.querySelector(DOMElements.hfToken).value
                // token: token
            }
        },
        getRandomTrack(){

        }
        

    }
})();


const APPController = (function(UICtrl, APICtrl){
    let randomNumber;
    let randomGenre =[];
    let randomPlaylist =[];
    let randomTrack = [];
    let list_of_genres = [];
    const DOMInputs = UICtrl.inputField();
    console.log(DOMInputs);
    
    const loadGenre = async() =>{
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token);
        
        const genres = await APICtrl.getGenres(token);

        genres.forEach(element => {
            list_of_genres[element.name] =element.id;
            UICtrl.createGenre(element.name, element.id);
        });
    //    console.log(list_of_genres);
       generateRandomGenre();
    }
    function getRandomNumber(min, max){
        let randomGenreNum = Math.floor((Math.random()* max) + min);
        return randomGenreNum;
    }
    const generateRandomGenre = async()=> {
        // let randomGenreNum = Math.floor(Math.random()* Object.keys(list_of_genres).length);
        let randomGenreNum  = getRandomNumber(0, Object.keys(list_of_genres).length);
        let keys = Object.keys(list_of_genres);
        let values = Object.values(list_of_genres);
        // console.log(keys[randomGenreNum], values[randomGenreNum]);
        randomGenre[keys[randomGenreNum]] = values[randomGenreNum]; 
        generateRandomPlaylist(randomGenre);
    }
    const generateRandomPlaylist = async(genre)=>{
        console.log(genre);
        const token = UICtrl.getStoredToken().token;
        const playlists = await APICtrl.getPlaylistByGenre(token, genre[Object.keys(genre)[0]]);
        let randomPlaylistNum = getRandomNumber(0, playlists.length);
        randomPlaylist = playlists[randomPlaylistNum]
        // console.log(randomPlaylist);
        generateRandomTrack(randomPlaylist);
    }
    const generateRandomTrack = async(playlist) =>{

        const token = UICtrl.getStoredToken().token;
        console.log(playlist);
    }
  document.addEventListener('click', async (e) =>{
       
        // console.log(e.target);
        if(e.target && e.target.className == 'btn-nav'){
            
            console.log(e.target);
            previewAudio.pause();
            e.preventDefault();
            // UIController.resetTrackDetail();
            const token = UICtrl.getStoredToken().token;
            // const playlistSelect = UICtrl.inputField().genreBtns;
            // console.log(playlistSelect);
        }
    })
        
    // DOMInputs.genre.addEventListener('change', async () =>{
    //     UICtrl.resetPlaylist();

    //     const token = UICtrl.getStoredToken().token;
    //     const genreSelect = UICtrl.inputField().genre;

    //     const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        
    //     const playlist = await APICtrl.getPlaylistByGenre(token, genreId);  

    //     playlist.forEach(element =>{
    //         // console.log(element);
    //         UICtrl.createPlaylist(element.name, element.tracks.href);
    //     });

    // });
    //  document.addEventListener('click', async (e) =>{
       
    //     // console.log(e.target);
    //     if(e.target && e.target.className == 'btn-nav'){
            
    //         console.log(e.target.text);
    //         previewAudio.pause();
    //         e.preventDefault();
    //         UIController.resetTrackDetail();
    //         const token = UICtrl.getStoredToken().token;
    //         // const playlistSelect = UICtrl.inputField().genreBtns;
    //         // console.log(playlistSelect);
    //     }
        

    // });
    // DOMInputs.submit.addEventListener('click', async (e) =>{
    //     e.preventDefault();
    //     UICtrl.resetTracks();

    //     const token = UICtrl.getStoredToken().token;
    //     const playlistSelect = UICtrl.inputField().playlist;
        
    //     UIController.resetTrackDetail();
    //     const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
    //     console.log(playlistSelect.options[playlistSelect.selectedIndex]);
    //     const tracks = await APICtrl.getTracks(token, tracksEndPoint);
    //     // console.log(tracks);
    //     tracks.forEach(element =>{
    //         UICtrl.createTrack(element.track.href, element.track.name)
    //     })

    // });
   
    // DOMInputs.tracks.addEventListener('click', async (e) =>{
    //     previewAudio.pause();
    //     e.preventDefault();
    //     UICtrl.resetTrackDetail();
    //     const token = UICtrl.getStoredToken().token;
    //     const trackEndPoint = e.target.id;
    //     // console.log(e.target);
    //     const track = await APIController.getTrack(token, trackEndPoint);
    //     // console.log(track)
    //     // previewAudio = new Audio(track.preview_url);
    //     // previewAudio.play();
    //     console.log(track.preview_url);
    //     // UIController.createAudio(track.preview_url);
    //     UIController.createTrackDetail(track.album.images[1].url, track.name, track.artists[0].name);
        
    // });
    
    // document.addEventListener('click', async (e) =>{
    //     if(e.target && e.target.id == 'preview'){
    //         console.log(e.target);
            
    //         previewAudio.play();
    //     }
    // });
    // document.getElementById("preview").addEventListener('click', async (e) =>{
    //     console.log(e.target);
    // });


    return {
        init(){
            console.log("App is starting");
            loadGenre();
            
            
        }
    }
    
})(UIController, APIController);

APPController.init();