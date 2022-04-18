import express from "express";
const app = express();
import sqlite3 from "better-sqlite3";
const database = new sqlite3("./main.sqlite3");

const config = {
    protocol: "http",
    host: "localhost",
    port: 3000,
    urlRegex: /^(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
};

app.use(express.urlencoded({ extended: true })); // Parse form data

// Init the database
database.prepare(`CREATE TABLE IF NOT EXISTS url (
    ID TEXT,
    origin TEXT
);`).run();

app.get("/", (request, response) => {
    response.status(200).send(
`<fieldset>
    <legend>URL to shorten</legend>
    <form method="post">
        <input type="url" name="url" required><br><br>
        <button type="submit">Submit</button>
    </form>
</fieldset>`);
});

app.get("/:id", (request, repsonse) => {
    const id = request.params.id;
    const query = database.prepare(`SELECT origin FROM url WHERE ID=?`).all(id);
    if (query.length > 0) {
        repsonse.status(301).redirect(query[0].origin);
    } else {
        repsonse.status(404).send(`URL not found`);
    }
});

app.post("/", (request, response) => {
    // Check if it's a valid url
    const { url } = request.body;
    if (!url || !config.urlRegex.test(url)) {
        response.status(400).send(`Please specify a (valid) URL.`);
        return;
    }

    // Check if the url is already in the database
    const query = database.prepare(`SELECT ID FROM url WHERE origin=?;`).all(url);
    if (query.length > 0) {
        response.status(200).send(`<a href="${config.protocol}://${config.host}:${config.port}/${query[0].ID}">${config.protocol}://${config.host}:${config.port}/${query[0].ID}</a>`);
        return;
    }

    // Generate a random id
    let id = "";
    for (let i = 0; i < 6; i++) id += Math.floor(Math.random() * 36).toString(36);

    // Insert the url into the database and send link
    database.prepare(`INSERT INTO url (ID, origin) VALUES (?, ?);`).run(id, url);
    response.status(200).send(`<a href="${config.protocol}://${config.host}:${config.port}/${id}">${config.protocol}://${config.host}:${config.port}/${id}</a>`);
});

app.listen(config.port, () => {
    console.log(`Server started on ${config.protocol}://${config.host}:${config.port}.`);
});
