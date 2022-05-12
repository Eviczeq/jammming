const clientId = 'ee9c3c686154491c9f4fd0f847d9a77d';
const redirectUri ='http://my_Jammming_Spotify.surge.sh/';
let accessToken; 
export const Spotify ={
    getAccessToken() {
        if(accessToken){
            return accessToken;
        }
        //check for acces token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if(accessTokenMatch && expiresInMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // clear parameters
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl =`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
            window.location = accessUrl;
        }
    },

    search(term){
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}` 
            }
        }).then(response => response.json())
        .then(jsonResponse => {
          if (!jsonResponse.tracks) return [];
          return jsonResponse.tracks.items.map(track => {
            return {
              id: track.id,
              name: track.name,
              artist: track.artists[0].name,
              album: track.album.name,
              uri: track.uri
            }
          })
        });
    },
    savePlaylist(name, trackURIs){
        if(!name || !trackURIs){
            return;
        }
        const endpoint = 'https://api.spotify.com/v1/me';
        const accessToken = Spotify.getAccessToken();
        const headers ={ Authorization: `Bearer ${accessToken}`};
        let userId;
        return fetch(endpoint, {headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            console.log(jsonResponse);
            console.log(name)
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                console.log(jsonResponse);
                console.log(playlistId);
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, 
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackURIs})
                })
            })
        })
    }
}

export default Spotify
