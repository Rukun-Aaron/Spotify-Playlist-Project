const APIController = (function () {

    const clientId = '71c43d9898df4834804e81bc4b28889c';
    const clientSecret = 'b94dee24c7c448ce9e99dcae134d648a';

    //private methods

    const _getToken = async () =>{
        const result = await fetch('https://accounts.spotify.com/api/token',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic' + btoa(clientId + ":" + clientSecret)
            },
            body: 'grant_type=authorization_code'
        });
        const data = await result.json();
        console.log(data.access_token);
        return data. data.access_token;
    }

    const _getGenres = async (token) =>{

        const result = await fetch('https://api.spotify.com/v1/browse/categories',{
            method :'GET',
            headers : {'Authorization': 'Bearer ' + token}
        })

        const data = await results.json();
        console.log(data.categories.items);
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 10;
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,{
            method: 'GET',
            headers : {'Authorization': 'Bearer ' + token}
        });

        const data = await results.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) =>{

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`,{

            method:'GET',
            headers:{'Authorization':token}
        });

        const data = await results.json();
        return data.items;

    }

    const _getTrack = async (token, trackEndPoint) =>{

        const result = await fetch(`${trackEndPoint}`,{
            method:'GET',
            headers:{'Authorization':token}
        });

        const data = await results.json();
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
            return _getTrack(token,tracksEndPoint);
        }
    }
    
})();

const UIController = (function() {
    
    const DOMElements ={
        selectGenres : '#select_genre',
        selectPlaylist : '#select_playlist',
        buttonSubmit : '#btn_submit',
        divSongDetail :'#song-detail',
        hfToken : '#hidden_token',
        divSonglist : '.song-list'
    }
    return{

        inputField() {
            return {
                genre : document.querySelector(DOMElements.selectGenres),
                playlist : document.querySelector(DOMElements.selectPlaylists),
                tracks : document.querySelector(DOMElements.divSonglist),
                submit : document.querySelector(DOMElements.buttonSubmit),
                songDetail :document.querySelector(DOMElements.songDetail)
            }
        },

        createGenre(text, value){
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenres).insertAdjacentHTML('beforeend',html);
        },
        
        createPlaylist(text, value){
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentElement('beforeend', html);
        },
        createTrack(id, name){
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            documents.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        createTrackDetail(img, title, artist){
            const detailDiv = document.querySelectors(DOMElements.divSongDetail);
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
            document.querySelector(DOMElements.hfToken).value = value;
        },
        getStoredToken(){
            return{
                token : document.querySelector(DOMElements.hfToken).value
            }
        }

    }
})();


const APPController = (function(UICtrl, APICtrl){

    const DOMInputs = UICtrl.inputField();

    const loadGenre = async() =>{
        const token = APICtrl.getToken();
        UICtrl.storeToken(token);
        
        const genres = APICtrl.getGenres(token);
        genres.forEach(element => {
            UICtrl.createGenre(element.name, element.id);
        });
    }

    DOMInputs.genre.addEventListener('change', async () =>{
        UICtrl.resetPlaylist();

        const token = UICtrl.getStoredToken().token;
        const genreSelect = UICtrl.inputField().genre;

        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);  

        playlist.forEach(element =>{
            UICtrl.createPlaylist(playlist.name, playlist.tracks.href);
        });

    });

    DOMInputs.submit.addEventListener('click', async (e) =>{
        e.preventDefault();
        UICtrl.resetTracks();

        const token = UICtrl.getStoredToken().token();
        const playlistSelect = UICtrl.inputField().playlist;
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        tracks.forEach(element =>{
            UICtrl.createTrack(element.track.href, element.track.name)
        })

    });
    
})(UIController, APPController);