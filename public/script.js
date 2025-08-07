let currentSong = new Audio();
let songs;
let currFolder;
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let play = document.getElementById("play");

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
    let a = await fetch(`./${folder}/`);

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

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = decodeURIComponent(song.split("/").pop().replace(".mp3", ""));
        songUL.innerHTML += `<li data-url="${song}">
    <img class="invert" src="./images/music.svg" alt="">
    <div class="info">
       <div>${songName}</div>
       <div>Aima Abbas</div>
    </div>
    <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="./images/play.svg" alt="">
    </div></li>`;
    }

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
    currentSong.src = `./${currFolder}/${fullURL}`;

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(fullURL.split("/").pop().replace(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00";

    if (pause) {
        currentSong.pause();
        play.src = `./images/play.svg`;
    } else {
        currentSong.play();
        play.src = `./images/pause.svg`;
    }
}

async function displayAlbums() {
    const folders = ["ncs", "cs"];
    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
        try {
            let response = await fetch(`./songs/${folder}/info.json`);
            let info = await response.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="./songs/${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        } catch (err) {
            console.error(`Error loading album ${folder}:`, err);
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
        });
    });
}

previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    const currentName = decodeURIComponent(currentSong.src.split("/").pop().replace(".mp3", ""));
    const index = songs.findIndex(song => decodeURIComponent(song.split("/").pop().replace(".mp3", "")) === currentName);

    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    }
});

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
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = `./images/pause.svg`;
        } else {
            currentSong.pause();
            play.src = `./images/play.svg`;
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });
}

main();
