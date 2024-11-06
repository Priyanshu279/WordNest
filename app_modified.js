let input = document.querySelector('#input');
let searchBtn = document.querySelector('#search');
let apiKey = 'c4bc2921-ff9f-472f-857c-4b56a371dbb0';
let notFound = document.querySelector('.not__found');
let defBox =  document.querySelector('.def');
let audioBox =  document.querySelector('.audio');
let loading = document.querySelector('.loading');

searchBtn.addEventListener('click',function(e){
    e.preventDefault();

    //clear data
    audioBox.innerHTML = '';
    notFound.innerText ='';
    defBox.innerText ='';
    
    //Get input data
    let word = input.value;

    //call API get data
    if(word ===''){
        alert('Word is required');
        return;
    }

    getData(word);

})

async function getData(word){
    loading.style.display = 'block';

    //Ajax call
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${apiKey}`);
    const data = await response.json();
    
    //if empty result
    if(!data.length){
        loading.style.display ='none';
        notFound.innerText = ' No result found';
        return;
    }

    // If result is suggetions
    if(typeof data[0] === 'string'){
        loading.style.display ='none';
        let heading = document.createElement('h3');
        heading.innerText = 'Did you mean?'
        notFound.appendChild(heading);
        data.forEach(element => {
            let suggetion = document.createElement('span');
            suggetion.classList.add('suggested');
            suggetion.innerText = element;
            notFound.appendChild(suggetion);
        })
        return;
    }

    // Result found
    loading.style.display ='none';
    let defination = data[0].shortdef[0];
    defBox.innerText = defination;

    // Sound
    const soundName = data[0].hwi.prs[0].sound.audio;
    if(soundName){
        renderSound(soundName);
    }
    console.log(data);

    function renderSound(soundName){
        // https://media.merriam-webster.com/soundc11
        let subfolder = soundName.charAt(0);
        let soundSrc = `https://media.merriam-webster.com/soundc11/${subfolder}/${soundName}.wav?key=${apiKey}`;

        let aud = document.createElement('audio');
        aud.src = soundSrc;
        aud.controls = true;
        audioBox.appendChild(aud);
    }
}
// Toast notification function
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Save and display recent searches
function updateRecentSearches(word) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!searches.includes(word)) {
        if (searches.length >= 5) searches.shift();
        searches.push(word);
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    }
    renderRecentSearches();
}

function renderRecentSearches() {
    const recentList = document.getElementById('recent-list');
    recentList.innerHTML = '';
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    searches.forEach(word => {
        const span = document.createElement('span');
        span.textContent = word;
        span.addEventListener('click', () => getData(word));
        recentList.appendChild(span);
    });
}

document.addEventListener('DOMContentLoaded', renderRecentSearches);

// Clear input on demand
const clearInputBtn = document.createElement('button');
clearInputBtn.textContent = 'Clear';
clearInputBtn.id = 'clear-input';
clearInputBtn.addEventListener('click', () => input.value = '');
document.querySelector('.input__wrap').appendChild(clearInputBtn);

// Toast notification for no results
function getData(word) {
    loading.style.display = 'block';

    fetch(`https://www.dictionaryapi.com/api/v3/references/learners/json/${word}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            if (!data.length) {
                showToast('No result found for "' + word + '"');
                return;
            }
            updateRecentSearches(word);

            if (typeof data[0] === 'string') {
                notFound.innerHTML = '<h3>Did you mean?</h3>';
                data.forEach(suggestion => {
                    let span = document.createElement('span');
                    span.classList.add('suggested');
                    span.textContent = suggestion;
                    span.addEventListener('click', () => getData(suggestion));
                    notFound.appendChild(span);
                });
                return;
            }

            defBox.innerText = data[0].shortdef[0];
            if (data[0].hwi.prs[0].sound.audio) renderSound(data[0].hwi.prs[0].sound.audio);
        })
        .catch(error => showToast('Error fetching data, please try again.'));
}
