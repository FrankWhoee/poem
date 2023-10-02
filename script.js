const main = document.getElementById("main");
const count = document.getElementById("count");
const read_button = document.getElementById("read");
const copybox = document.getElementById("copybox");

main.textContent = "";

let total_read_poems = getCookie("total_read_poems")
let poems_read = getCookie("poems_read")
let curr_poem = getCookie("curr_poem")
let last_time_visited = getCookie("last_time_visited")
let curr_read = getCookie("curr_read")

let curr_text = "";

let curr_id = "";
let curr_title = "";

if (total_read_poems == undefined) {
    total_read_poems = 0;
    writeCookie("total_read_poems", total_read_poems);
}

if (poems_read == undefined) {
    poems_read = ",";
    writeCookie("poems_read", poems_read);
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

if (curr_poem == undefined || last_time_visited == undefined || today.toDateString() !== new Date(parseInt(last_time_visited)).toDateString()) {
    showRandomPoem().then((res) => {
        let id = res[0];
        let title = res[1];
        curr_read = 0;

        curr_id = id;
        curr_title = title;
        
        writeCookie("curr_read", curr_read);
        writeCookie("curr_poem", title);
        writeCookie("last_time_visited", today.getTime());
    });
} else {
    showPoem(curr_poem);
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1];
}

function writeCookie(name, value) {
    console.log("writing cookie");
    document.cookie = `${name}=${value}`;
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

    if(poems_read.includes(await getID(j["author"], j["title"]))) {
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
        writeCookie("total_read_poems", total_read_poems);
        count.textContent = total_read_poems;

        curr_read = 1;
        writeCookie("curr_read", curr_read);

        read_button.disabled = true;

        writeCookie("poems_read", poems_read + curr_id + ",");
    }
}

function copyPoem() {
  // Get the text field
  copybox.value = curr_text;

  // Select the text field
  copybox.select();
  copybox.setSelectionRange(0, 99999); // For mobile devices

   // Copy the text inside the text field
  navigator.clipboard.writeText(copybox.value);
}
