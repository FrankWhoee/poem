const main = document.getElementById("main");
const count = document.getElementById("count");
const read_button = document.getElementById("read");
const copybox = document.getElementById("copybox");

main.textContent = "Loading..."

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramTitle = urlParams.get('title');

let total_read_poems = getFromLocalStorage("total_read_poems")
let poems_read = getFromLocalStorage("poems_read")
let curr_poem = getFromLocalStorage("curr_poem")
let last_time_visited = getFromLocalStorage("last_time_visited")
let curr_read = getFromLocalStorage("curr_read")

let curr_text = "";

let curr_id = "";
let curr_title = "";

if (total_read_poems == undefined) {
    total_read_poems = 0;
    writeToLocalStorage("total_read_poems", total_read_poems);
}

if (poems_read == undefined) {
    poems_read = ",";
    writeToLocalStorage("poems_read", poems_read);
}

if (curr_read != undefined) {
    curr_read = parseInt(curr_read);
    if (curr_read == 1) {
        read_button.disabled = true;
    } else {
        read_button.disabled = false;
    }
}


count.textContent = total_read_poems;
const today = new Date();

if (paramTitle == undefined || curr_poem == undefined || last_time_visited == undefined || today.toDateString() !== new Date(parseInt(last_time_visited)).toDateString()) {
    showRandomPoem().then((res) => {
        let id = res[0];
        let title = res[1];
        curr_read = 0;

        curr_id = id;
        curr_title = title;

        writeToLocalStorage("curr_read", curr_read);
        writeToLocalStorage("curr_poem", title);
        writeToLocalStorage("last_time_visited", today.getTime());
    });
} else if (paramTitle == undefined) {
    showPoem(curr_poem);
} else if (paramTitle != undefined) {
    showPoem(paramTitle);
}

function getFromLocalStorage(name) {
    return localStorage.getItem(name);
}

function writeToLocalStorage(name, value) {
    localStorage.setItem(name, value);
}

// https://poetrydb.org/author/Geoffrey%20Chaucer/author,title

async function getID(author, title) {
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

async function showPoem(title) {
    let response = await fetch(`https://poetrydb.org/title/${title}`);
    let j = await response.json();
    j = j[0];

    main.textContent = "";

    let elemTitle = document.createElement("p");
    let elemAuthor = document.createElement("p");
    let linebreak = document.createElement("br");

    elemTitle.textContent = j["title"];
    elemAuthor.textContent = "by " + j["author"];

    main.appendChild(elemTitle);
    main.appendChild(elemAuthor);
    main.appendChild(linebreak);

    curr_text += title + "\nby " + j["author"] + "\n\n";

    j["lines"].forEach((line) => {
        curr_text += line + "\n";
        let text = document.createElement("p");
        text.textContent = line;
        main.appendChild(text);
    });

    curr_id = await getID(j["author"], j["title"]);
    curr_title = await j["title"];
}

async function showRandomPoem() {
    let response = await fetch("https://poetrydb.org/random");
    let j = await response.json();
    j = j[0];

    main.textContent = "";

    if (poems_read.includes(await getID(j["author"], j["title"]))) {
        return showRandomPoem();
    }

    let title = document.createElement("p");
    let author = document.createElement("p");
    let linebreak = document.createElement("br");

    title.textContent = j["title"];
    author.textContent = "by " + j["author"];

    main.appendChild(title);
    main.appendChild(author);
    main.appendChild(linebreak);

    curr_text += j["title"] + "\nby" + j["author"] + "\n\n";

    j["lines"].forEach((line) => {
        curr_text += line + "\n";
        let text = document.createElement("p");
        text.textContent = line;
        main.appendChild(text);
    });

    return [await getID(j["author"], j["title"]), j["title"]];
}

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
    const host = window.location.host;
    const pathname = window.location.pathname;
    copybox.value = host + pathname + "?title=" + curr_title;

    // Select the text field
    copybox.select();
    copybox.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copybox.value);
}
