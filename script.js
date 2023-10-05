let main, count, read_button, copybox, shortOnlyElem, curr_id, curr_title

let total_read_poems = getFromLocalStorage("total_read_poems")
let poems_read = getFromLocalStorage("poems_read")
let curr_poem = getFromLocalStorage("curr_poem")
let last_time_visited = getFromLocalStorage("last_time_visited")
let curr_read = getFromLocalStorage("curr_read")
let short_only = getFromLocalStorage("short_only")

function getFromLocalStorage(name) {
    return localStorage.getItem(name);
}

function writeToLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

window.addEventListener('DOMContentLoaded', () => {
    main = document.getElementById("main");
    count = document.getElementById("count");
    read_button = document.getElementById("read");
    copybox = document.getElementById("copybox");
    shortOnlyElem = document.getElementById("shortonly");

    main.textContent = "Loading..."

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paramTitle = urlParams.get('title');


    curr_id = "";
    curr_title = "";

    if (total_read_poems == undefined) {
        total_read_poems = 0;
        writeToLocalStorage("total_read_poems", total_read_poems);
    }

    if (poems_read == undefined) {
        poems_read = ",";
        writeToLocalStorage("poems_read", poems_read);
    }

    if (short_only == undefined) {
        short_only = true;
        writeToLocalStorage("short_only", short_only);
    } else {
        short_only = short_only === "true";
    }

    if (curr_read != undefined) {
        curr_read = parseInt(curr_read);
        if (curr_read == 1) {
            read_button.disabled = true;
        } else {
            read_button.disabled = false;
        }
    }

    if (short_only) {
        shortOnlyElem.checked = true;
    } else {
        shortOnlyElem.checked = false;
    }


    count.textContent = total_read_poems;
    const today = new Date();

    if (paramTitle == null && (curr_poem == undefined || last_time_visited == undefined || today.toDateString() !== new Date(parseInt(last_time_visited)).toDateString())) {
        showRandomPoem();
    } else if (paramTitle == undefined) {
        showPoem(curr_poem);
    } else if (paramTitle != undefined) {
        showPoem(paramTitle);
    }


// https://poetrydb.org/author/Geoffrey%20Chaucer/author,title

    async function getID(data) {
        let author = data["author"];
        let title = data["title"];

        let authors = (await (await fetch(`https://poetrydb.org/author`)).json())["authors"];
        let aid = authors.indexOf(author);
        let titles = (await (await fetch(`https://poetrydb.org/author/${author}/title`)).json());
        for (let tid = 0; tid < titles.length; tid++) {
            if (titles[tid]["title"] === title) {
                return aid + "|" + tid;
            }
        }
        return undefined;
    }

    async function getRandomPoem() {
        let response = await fetch("https://poetrydb.org/random");
        let data = await response.json();
        return data[0];
    }

    async function getPoemByTitle(title) {
        let response = await fetch(`https://poetrydb.org/title/${title}`);
        let data = await response.json();
        return data[0];
    }

    function renderPoem(data) {
        main.innerHTML = "";
        let elemTitle = document.createElement("p");
        let elemAuthor = document.createElement("p");
        let linebreak = document.createElement("br");

        elemTitle.textContent = data["title"];
        elemAuthor.textContent = "by " + data["author"];

        main.appendChild(elemTitle);
        main.appendChild(elemAuthor);
        main.appendChild(linebreak);

        data["lines"].forEach((line) => {
            let text = document.createElement("p");
            text.textContent = line;
            main.appendChild(text);
        });
    }

    async function showPoem(title) {
        let data = await getPoemByTitle(title);
        curr_id = await getID(data);
        curr_title = await data["title"];

        renderPoem(data);
    }


    async function showRandomPoem() {
        let data = await getRandomPoem();

        let title = data["title"];
        let id = await getID(data);

        // Try until we get a poem that hasn't been read and is the right length
        while (poems_read.includes(id) || (short_only && data["lines"].length > 30)) {
            if (poems_read.includes(id)) {
                console.log("Already read poem: " + title);
            } else {
                console.log("Too long: " + title);
            }
            data = await getRandomPoem();
            id = await getID(data);
        }

        curr_read = 0;
        curr_id = id;
        curr_title = title;

        writeToLocalStorage("curr_read", curr_read);
        writeToLocalStorage("curr_poem", title);
        writeToLocalStorage("last_time_visited", today.getTime());

        read_button.disabled = false;

        renderPoem(data);
    }
});


function incrementTotalRead() {
    if (curr_read == undefined || curr_read == 0) {
        total_read_poems++;
        writeToLocalStorage("total_read_poems", total_read_poems);
        count.textContent = total_read_poems;

        curr_read = 1;
        writeToLocalStorage("curr_read", curr_read);

        read_button.disabled = true;

        writeToLocalStorage("poems_read", poems_read + curr_id + ",");
    }
}

function copyPoem() {
    // Get the text field
    const protocol = window.location.protocol;
    const host = window.location.host;
    const pathname = window.location.pathname;
    copybox.value = protocol + "//" + host + pathname + "?title=" + encodeURIComponent(curr_title);

    // Select the text field
    copybox.select();
    copybox.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copybox.value);
}

function toggleShortOnly() {
    short_only = shortOnlyElem.checked;
    writeToLocalStorage("short_only", short_only);
}