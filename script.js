let currentSong = new Audio();
let songs;
let currFolder;
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let play = document.getElementById("play");
// getting Base uld function 
function getBaseUrl() {
    // If deploying from root, return empty
    return window.location.hostname.includes("vercel.app") ? "" : "";
}
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${getBaseUrl()}/${folder}/`);

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = decodeURIComponent(song.split("/").pop().replace(".mp3", ""));
        songUL.innerHTML += `<li data-url="${song}">
    <img class="invert" src="${getBaseUrl()}/images/music.svg" alt="">
    <div class="info">
       <div>${songName}</div>
       <div>Aima Abbas</div>
    </div>
    <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="${getBaseUrl()}/images/play.svg" alt="">
    </div></li>`;

    }
    //atach each song from event listener 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let url = e.getAttribute("data-url");
            let track = decodeURIComponent(url.split("/").pop().replace(".mp3", ""));
            console.log("Now playing:", track);
            playMusic(url);

        });
    });



}
const playMusic = (fullURL, pause = false) => {
    currentSong.src = `${getBaseUrl()}/${currFolder}/${fullURL}`;


    document.querySelector(".songinfo").innerHTML = decodeURIComponent(fullURL.split("/").pop().replace(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00";

    if (pause) {
        currentSong.pause();
        play.src = `${getBaseUrl()}/images/play.svg`;

    } else {
        currentSong.play(); // Auto-play the song
        play.src = `${getBaseUrl()}/images/pause.svg`;

    }
}


//displaying album function
// ✅ Replace this function
async function displayAlbums() {
    // 👇 Hardcoded list of folders (replace/add more as needed)
    const folders = ["ncs", "cs"];

    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
        try {
            let response = await fetch(`${getBaseUrl()}/songs/${folder}/info.json`);
            let info = await response.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="${getBaseUrl()}/songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        } catch (err) {
            console.error(`Error loading album ${folder}:`, err);
        }
    }

    // 👇 Event listener for each album
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
        });
    });
}


// Add an event listener to previous
previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    // Get just the file name without extension
    const currentName = decodeURIComponent(currentSong.src.split("/").pop().replace(".mp3", ""));
    // Find index by comparing only the base name (without .mp3)
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop().replace(".mp3", "")) === currentName);

    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    }
});

// Add an event listener to next

next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    const currentName = decodeURIComponent(currentSong.src.split("/").pop().replace(".mp3", ""));
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop().replace(".mp3", "")) === currentName);

    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    }
});


async function main() {
    // get list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    //display all albums
    displayAlbums()
    //attach an event listner to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = `${getBaseUrl()}/images/pause.svg`;
        }
        else {
            currentSong.pause();
            play.src = `${getBaseUrl()}/images/play.svg`;
        }
    })
    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // listen for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // listen for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // listen for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    })




}

main();
