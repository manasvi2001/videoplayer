// Import stylesheets
import './style.css';
import response from './config';

// Write Javascript code!
document.querySelector('.custom-select-wrapper').addEventListener('click', function() {
    this.querySelector('.custom-select').classList.toggle('open');
});
let init = true;
let video = document.querySelector("#current-video");
let source = document.querySelector("#current-video-source");
let videoHeading = document.querySelector("#heading__video");
let videoOverlay = document.querySelector(".video__overlay");
let videoState;
let selectedVideoIndex = 0;
let selectedLanguageIndex = 0;
let data = response.data;
let languages = data.languages;
let videos = data.videos;
let selectedLanguage = data.languages[selectedLanguageIndex];
let selectedURL = selectedLanguage.url;
let selectedVideo = data.videos[selectedVideoIndex];
let videoURL = selectedVideo.source.replace("{language}", selectedURL);

let videoListContainer = document.querySelector(".tutorial__list");
let optionsContainer = document.querySelector(".custom-options");

let loadVideoList = () => {
  let innerContent = ``;
  for(let i = 0; i < videos.length; i++) {
    innerContent = innerContent + `
      <div class="tutorial__item-group">
        <input type="radio" class="item__radio-input" ${i === selectedVideoIndex ? 'checked': ''} id="item${i}" name="tutorial-item">
        <label for="item${i}" class="item__radio-label">
          ${videos[i].title[selectedLanguage.name]}
          <span class="item__radio-button${init && (i === selectedVideoIndex) ? ' item__radio-button--play' : ''}"></span>
        </label>
      </div>
    `;
  }
  videoListContainer.innerHTML = innerContent;
  let i = 0;
  for (const videoItem of document.querySelectorAll(".item__radio-input")) {
    let currentVideoIndex = i;
    videoItem.addEventListener('click', function() {
      if (init) {
        init = false;
      }
      let checked = this.hasAttribute('checked');
      if (!checked) {
        let prevCheckedRadio = document.querySelector(".item__radio-input[checked] ~ .item__radio-label .item__radio-button")
        if (prevCheckedRadio.classList.contains("item__radio-button--play")) {
          prevCheckedRadio.classList.remove("item__radio-button--play");
        }
        document.querySelector(".item__radio-input[checked]").removeAttribute("checked");
        this.setAttribute("checked","checked");
        selectedVideoIndex = currentVideoIndex;
        selectedVideo = videos[selectedVideoIndex];
        selectedURL = selectedLanguage.url;
        videoChange();
      } else {
        videoState = document.querySelector(".item__radio-input:checked ~ .item__radio-label .item__radio-button");
        if (video.paused) {
          videoState.classList.remove("item__radio-button--play");
          if (init) {
            init = false;
          }
          video.play();
        } else {
          videoState.classList.add("item__radio-button--play");
          video.pause();
        }
      }
    });
    i = i + 1;
  }
}

let loadLanguages = () => {
  let innerContent = ``;
  for(let i = 0; i < languages.length; i++) {
    innerContent = innerContent + `
      <span class="custom-option${i === 0 ? ' selected': ''}" data-value="${languages[i].name}"><span>${languages[i].name}</span><span>${languages[i].nameLocale}</span></span>
    `;
  }
  optionsContainer.innerHTML = innerContent;
}

let videoChange = () => {
  videoHeading.innerHTML = selectedVideo.title[selectedLanguage.name];
  source.setAttribute("src", selectedVideo.source.replace("{language}", selectedURL));
  video.load();
  if (!init) {
    video.play();
  } else {

  }
}

loadVideoList();
loadLanguages();
videoChange();

let i = 0;
for (const option of document.querySelectorAll(".custom-option")) {
  let languageIndex = i;
  option.addEventListener('click', function() {
    if (!this.classList.contains('selected')) {
      this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
      this.classList.add('selected');
      selectedLanguageIndex = languageIndex;
      selectedLanguage = languages[languageIndex];
      this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = selectedLanguage.nameLocale;
      selectedURL = selectedLanguage.url;
      loadVideoList();
      videoChange();
    }
  });
  i = i + 1;
}

window.addEventListener('click', function(e) {
  const select = document.querySelector('.custom-select')
  if (!select.contains(e.target)) {
      select.classList.remove('open');
  }
});

let playNext = () => {
  if (selectedVideoIndex + 1 < videos.length) {
    selectedVideoIndex = selectedVideoIndex + 1;
    document.querySelectorAll(".item__radio-input")[selectedVideoIndex].click();
  }
}

let goToPracticeGame = () => {
  // to be done in widget
}

let seekForwardByFive = () => {
  video.currentTime += 5;
  if (video.paused) {
    video.play();
  }
}

let seekBackwardByFive = () => {
  video.currentTime -= 5;
  if (video.paused) {
    video.play();
  }
}

let replay = () => {
  video.currentTime = 0;
  if (video.paused) {
    video.play();
  }
}

video.onended = () => {
  let prevCheckedRadio = document.querySelector(".item__radio-input[checked] ~ .item__radio-label .item__radio-button")
  if (!prevCheckedRadio.classList.contains("item__radio-button--play")) {
    prevCheckedRadio.classList.add("item__radio-button--play");
  }
  videoOverlay.classList.replace("video__overlay--hide", "video__overlay--show");
  if (selectedVideoIndex + 1 < videos.length) {
    videoOverlay.innerHTML = `<div class="video__paused-container">
      <div class="video__play"></div>
    </div>
    <div class="heading__tertiary--small video__overlay--heading">Up Next <span id="video__countdown-timer">5 sec</span></div>
    <div class="heading__tertiary video__overlay--heading">${videos[selectedVideoIndex + 1].title[selectedLanguage.name]}</div>
    <div class="game__button">Practice game now</div>
    <div class="video__replay">Watch again</div>
    `;
    let t = 4;
    let clearCallback = setInterval(function() {
      if (t <= 0) {
        if (t === 0) {
          playNext();
        }
        clearInterval(clearCallback);
      } else {
        document.querySelector("#video__countdown-timer").innerHTML = `${t} sec`;
        t = t - 1;
      }
    }, 1000);
    document.querySelector(".video__play").addEventListener('click', function () {
      clearInterval(clearCallback);
      playNext();
    });
    document.querySelector(".video__replay").addEventListener('click', function () {
      clearInterval(clearCallback);
      replay();
    });
  } else {
    videoOverlay.innerHTML = `
    <div class="heading__tertiary--small video__overlay--heading">Tutorial Completed</div>
    <div class="heading__tertiary video__overlay--heading">Start Playing Rummy Now!</div>
    <div class="game__button">Play Game</div>
    <div class="video__replay">Watch again</div>
    `;
    document.querySelector(".video__replay").addEventListener('click', function () {
      replay();
    });
  }
}

video.onloadeddata = () => {
  if (init) {
    videoOverlay.classList.replace("video__overlay--hide", "video__overlay--show");
    videoOverlay.innerHTML = `<div class="video__paused-container">
      <div class="video__rewind"></div>
      <div class="video__play"></div>
      <div class="video__forward"></div>
    </div>
    <div class="heading__tertiary video__overlay--heading">Start Playing Practice Now!</div>
    <div class="game__button">Play Now</div>
    `;
    addSeekListeners();
  }
}

video.onpause = () => {
  videoOverlay.classList.replace("video__overlay--hide", "video__overlay--show");
  videoOverlay.innerHTML = `<div class="video__paused-container">
    <div class="video__rewind"></div>
    <div class="video__play"></div>
    <div class="video__forward"></div>
  </div>
  <div class="heading__tertiary video__overlay--heading">Start Playing Practice Now!</div>
  <div class="game__button">Play Now</div>
  `;
  videoState = document.querySelector(".item__radio-input:checked ~ .item__radio-label .item__radio-button");
  videoState.classList.add("item__radio-button--play");
  addSeekListeners();
}

video.onplaying = () => {
  videoOverlay.classList.replace("video__overlay--show", "video__overlay--hide");
  videoOverlay.innerHTML = '';
  videoState = document.querySelector(".item__radio-input:checked ~ .item__radio-label .item__radio-button");
  videoState.classList.remove("item__radio-button--play");
}

let addSeekListeners = () => {
  document.querySelector(".video__rewind").addEventListener('click', function () {
    seekBackwardByFive();
  });

  document.querySelector(".video__forward").addEventListener('click', function () {
    seekForwardByFive();
  });

  document.querySelector(".video__play").addEventListener('click', function () {
    video.play();
  });
}
