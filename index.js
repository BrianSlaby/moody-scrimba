/* === Imports === */
import { initializeApp } from "firebase/app"
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile 
} from "firebase/auth"
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp,
    getDocs 
} from "firebase/firestore"

/* === Firebase Setup === */
const firebaseConfig = {

    apiKey: "AIzaSyCR4zFTbfnpWgH-gjNOPL8voo5Bj0mocJc",
    authDomain: "moody-97b2e.firebaseapp.com",
    projectId: "moody-97b2e",
    storageBucket: "moody-97b2e.appspot.com",
    messagingSenderId: "169298961223",
    appId: "1:169298961223:web:43fb3a4f67ffdaed496262"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

/* === UI === */



/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")
const userGreetingEl = document.getElementById("user-greeting")

const displayNameInputEl = document.getElementById("display-name-input")
const photoURLInputEl = document.getElementById("photo-url-input")
const updateProfileButtonEl = document.getElementById("update-profile-btn")

const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn")
const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")

const fetchPostsButtonEl = document.getElementById("fetch-posts-btn")

const postsEl = document.getElementById("posts")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

for (let moodEmojiEl of moodEmojiEls) {
    moodEmojiEl.addEventListener("click", selectMood)
}

updateProfileButtonEl.addEventListener("click", authUpdateProfile)

postButtonEl.addEventListener("click", postButtonPressed)

fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB)

/* === State === */

let moodState = 0

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView()
        showProfilePicture(userProfilePictureEl, user)
        showUserGreeting(userGreetingEl, user)
    } else {
        showLoggedOutView()
    }
  })

/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    
    signInWithPopup(auth, provider)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        // const user = result.user;
        console.log("Signed in with Google")
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
    })
}

function authSignInWithEmail() {
    const email = emailInputEl.value
    const password = passwordInputEl.value

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        clearAuthFields()
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
    })
}

function authCreateAccountWithEmail() {
    const email = emailInputEl.value
    const password = passwordInputEl.value

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        clearAuthFields()
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
    })
}

function authSignOut() {

    signOut(auth).then(() => {
        
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
      })
}

function authUpdateProfile() {
    const newDisplayName = displayNameInputEl.value
    const newPhotoURL = photoURLInputEl.value

    updateProfile(auth.currentUser, {
        displayName: newDisplayName, photoURL: newPhotoURL
        })
    .then(() => {
        console.log("profile updated")
        displayNameInputEl.value = ""
        photoURLInputEl.value = ""
      }).catch((error) => {
        console.error(error.message)
      })
}

/* = Functions - Firebase - Cloud Firestore = */

async function addPostToDB(postBody, user) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
          body: postBody,
          uid: user.uid,
          createdAt: serverTimestamp(),
          mood: moodState
        });
        console.log(`Document written with ID: ${docRef.id}`)
      } catch (error) {
        console.error(`Error adding document: , ${error.message}`)
      }
}

async function fetchOnceAndRenderPostsFromDB() {

    const querySnapshot = await getDocs(collection(db, "posts"))
    clearAll(postsEl)

    querySnapshot.forEach((doc) => {
        renderPost(postsEl, doc.data())
    })

}

/* == Functions - UI Functions == */

function renderPost(postsEl, postData) {
    const { createdAt, mood, body } = postData
    postsEl.innerHTML += `
        <div class="post">
            <div class="header">
                <h3>${displayDate(createdAt)}</h3>
                <img src="assets/emojis/${mood}.png">
            </div>
            <p>${body}</p>
        </div>
        `
}

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser
    
    if (postBody && moodState) {
        addPostToDB(postBody, user)
        clearInputField(textareaEl)
        resetAllMoodElements(moodEmojiEls)
    }
}

function clearAll(element) {
    element.innerHTML = ``
}

function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
}

function showView(view) {
    view.style.display = "flex"
}

function hideView(view) {
    view.style.display = "none"
}

function clearInputField(field) {
	field.value = ""
}

function clearAuthFields() {
	clearInputField(emailInputEl)
	clearInputField(passwordInputEl)
}

function showProfilePicture(imgElement, user) {
    if (user.photoURL) {
        imgElement.src = user.photoURL
    } else {
        imgElement.src = "assets/images/default-profile-picture.jpeg"
    }
}

function showUserGreeting(element, user) {
    if (user.displayName) {
        const firstName = user.displayName.split(" ")[0]
        element.textContent = `Hey ${firstName}, how are you?`
    } else {
        element.textContent = "Hey friend, how are you?"
    }
}

function displayDate(firebaseDate) {
    const date = firebaseDate.toDate()
    
    const day = date.getDate()
    const year = date.getFullYear()
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year} - ${hours}:${minutes}`
}

/* = Functions - UI Functions - Mood = */

function selectMood(event) {
    const selectedMoodEmojiElementId = event.currentTarget.id
    
    changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)
    
    const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
    
    moodState = chosenMoodValue
}

function changeMoodsStyleAfterSelection(selectedMoodElementId, allMoodElements) {
    for (let moodEmojiEl of moodEmojiEls) {
        if (selectedMoodElementId === moodEmojiEl.id) {
            moodEmojiEl.classList.remove("unselected-emoji")          
            moodEmojiEl.classList.add("selected-emoji")
        } else {
            moodEmojiEl.classList.remove("selected-emoji")
            moodEmojiEl.classList.add("unselected-emoji")
        }
    }
}

function resetAllMoodElements(allMoodElements) {
    for (let moodEmojiEl of allMoodElements) {
        moodEmojiEl.classList.remove("selected-emoji")
        moodEmojiEl.classList.remove("unselected-emoji")
    }
    
    moodState = 0
}

function returnMoodValueFromElementId(elementId) {
    return Number(elementId.slice(5))
}