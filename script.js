// actual code that does all of the functionality! 

// declaration of variables
let video = document.getElementById("video");
let countdown = document.getElementById("countdown");
let flash = document.getElementById("flash");
let filter = "none";
let photos = [];
let currentPhoto = 0;
let message = "";
// needs to be a constant so it doesnt refresh evrytime
// but i still think it isn't working yet
let savedStrips = JSON.parse(localStorage.getItem("photoStrips")) || [];
// // attempt to make the gallery actually save fr
// const fs = require('fs');

// initialize camera when the start button is clicked and change screens
document.getElementById("start-btn").onclick = () => {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("camera-screen").classList.add("active");
  startCamera();
};

// data filter selection functionality
document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.onclick = () => {
    filter = btn.dataset.filter;
    video.style.filter = filter;
  };
});

// makes sure that three photos are taken
// mimics actual photo booth that keeps taking pics
// goes to message screen once all pics are taken
document.getElementById("snap-btn").onclick = async () => {
  if (currentPhoto < 3) {
    await autoCapturePhotos();
    if (currentPhoto === 3) {
      showMessageScreen();
    }
  }
};

// shows photo strip once message is submitted
document.getElementById("add-message-btn").onclick = () => {
  message = document.getElementById("message-input").value;
  showPhotoStrip();
};

// restart! 
document.getElementById("restart-btn").onclick = () => {
  photos = [];
  currentPhoto = 0;
  document.getElementById("sheet-screen").classList.remove("active");
  document.getElementById("welcome-screen").classList.add("active");
};

// start camera
// ask for permissions (thx stack overflow for guidance)
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
  });
}

// actually take the photos
async function autoCapturePhotos() {
  for (let i = 0; i < 3; i++) {
    await countdownAndFlash();
    capturePhoto();
    currentPhoto++;
    await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before the next photo
  }
}

// show flash! mimics actual photo booth 
async function countdownAndFlash() {
  for (let i = 3; i > 0; i--) {
    countdown.textContent = i;
    await new Promise(res => setTimeout(res, 1000));
  }
  countdown.textContent = "";
  flashEffect();
}

// the actual flash functionality 
// still kinda ugly, but its the only thing i could think of..
function flashEffect() {
  let cameraContainer = document.querySelector('.camera-container');
  cameraContainer.style.transition = "background-color 0.3s ease";
  cameraContainer.style.backgroundColor = "#ffffff"; // White flash effect
  setTimeout(() => {
    cameraContainer.style.backgroundColor = "transparent"; // Reset background color
  }, 300);
}

// photo taking functionality 
function capturePhoto() {
  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  let ctx = canvas.getContext("2d");
  ctx.filter = filter;
  ctx.drawImage(video, 0, 0);
  photos.push(canvas);
}

// screen transferring functions 

// displays the message screen itself! 
function showMessageScreen() {
  document.getElementById("camera-screen").classList.remove("active");
  document.getElementById("message-screen").classList.add("active");
}

// shows the photo strip 
function showPhotoStrip() {
    document.getElementById("message-screen").classList.remove("active");
    document.getElementById("sheet-screen").classList.add("active");
  
    // Create canvas and set dimensions for the photo strip
    let canvas = document.getElementById("photo-strip");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    let photoWidth = 200; // Width of each photo (slightly smaller for the cute effect - but somehow still looks warped)
    let photoHeight = 280; // Height of each photo
    let gap = 20; // White space between photos (need 2 fix bcuz it looks kinda ugly)
    let yOffset = 10; // Initial Y offset for positioning the photos
  
    // Draw each photo with a gap in between
    photos.forEach((photo, i) => {
      ctx.drawImage(photo, gap, yOffset + i * (photoHeight + gap), 100, 200);
    });
  
    // Add message text if available 
    if (message) {
      ctx.font = "30px 'Dancing Script', cursive";
      ctx.fillStyle = "#3a2e39";
      ctx.fillText(message, 20, canvas.height - 20);
    }
  
    // Update the download button with the canvas data URL 
    // then users can download the image itself! 
    document.getElementById("download-btn").href = canvas.toDataURL();

    // Save the strip 
    // this isn't working consistently... need to fix 
    savedStrips.push(canvas.toDataURL());
    localStorage.setItem("photoStrips", JSON.stringify(savedStrips));

  }
  
// shows all of the prior strips taken
// this would be cool for sharefair cuz then we would have lil memories of all visitors
// but i need to make it store on some place where it can be accessed later
function showGallery() {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("gallery-screen").classList.add("active");

  let galleryContainer = document.getElementById("gallery-container");
  galleryContainer.innerHTML = ""; // Clear old entries

  savedStrips.forEach((stripUrl, index) => {
    let card = document.createElement("div");
    card.classList.add("gallery-card");

    // Image
    let img = document.createElement("img");
    img.src = stripUrl;
    img.classList.add("gallery-img");

    // ❌ Delete Button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => {
      savedStrips.splice(index, 1); // remove the selected strip
      localStorage.setItem("photoStrips", JSON.stringify(savedStrips)); // update local storage
      showGallery(); // re-render the gallery
    };

    card.appendChild(deleteBtn); // add the delete button to the card
    card.appendChild(img);       // add the photo to the card
    galleryContainer.appendChild(card); // add card to the gallery
  });

  // Show empty message if nothing left
  document.getElementById("gallery-empty-message").style.display = savedStrips.length === 0 ? "block" : "none";
}


// go back home
// hide anything else that is there! works for all other screens 
// i don't think i ended up using this..
// but i might
function returnHome() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById("welcome-screen").classList.add("active");
  }

// // Save array to file
// function saveArrayToFile(array, filePath) {
//     const jsonString = JSON.stringify(array);
//     fs.writeFileSync(filePath, jsonString);
// }

// // Retrieve array from file
// function getArrayFromFile(filePath) {
//     const filePath = 'savedStrips.json';
//     saveArrayToFile(savedStrips, filePath);
//     savedStrips = getArrayFromFile(filePath);
//     try {
//     const jsonString = fs.readFileSync(filePath, 'utf-8');
//     return JSON.parse(jsonString);
//     } catch (error) {
//     return []; // Return an empty array if file does not exist or is empty
//     }
// }

