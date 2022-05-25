import express from "express";
const app = express();
import sqlite3 from "better-sqlite3";
const database = new sqlite3(`./main.sqlite3`);

const config = {
    port: 8035,
    urlRegex: /^(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
};

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Remove unneeded header
app.disable(`X-Powered-By`);

// Init the database
database
    .prepare(
        `CREATE TABLE IF NOT EXISTS url (
    ID TEXT,
    origin TEXT
);`,
    )
    .run();

process.on("SIGINT", () => {
    database.close();
    process.exit();
});

app.get(`/`, (_request, response) => {
    response.status(200).send(`<!DOCTYPE html>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>boiurl</title>
<style>
    @media (prefers-color-scheme: dark) {
        body {
            background-color: #252525;
            color: #fff;
        }
    }
</style>
<fieldset>
    <legend>URL to shorten</legend>
    <form method="post">
        <input class="form" type="url" name="url" required><br><br>
        <button class="form" type="submit">Submit</button>
    </form>
</fieldset>`);
});

app.get(`/:id`, (request, response) => {
    const id = request.params.id;
    const query = database.prepare(`SELECT origin FROM url WHERE ID=?;`).all(id);
    if (query.length > 0) {
        response.status(301).redirect(query[0].origin);
    } else {
        response.status(404).send(`URL not found`);
    }
});

app.post(`/`, (request, response) => {
    // Check if it is a valid url
    const { url } = request.body;
    if (!url || !config.urlRegex.test(url)) {
        response.status(400).send(`Please specify a (valid) URL.`);
        return;
    }

    // Check if the url is already in the database
    const query = database.prepare(`SELECT ID FROM url WHERE origin=?;`).all(url);
    if (query.length > 0) {
        response.status(200).send(
            `<!DOCTYPE html>
<style>
    a {
        color: #000;
    }

    @media (prefers-color-scheme: dark) {
        body {
            background-color: #252525;
        }

        a {
            color: #fff;
        }
    }
</style>
<a href="//${request.headers.host}/${query[0].ID}">${request.protocol}://${request.headers.host}/${query[0].ID}</a>`,
        );
        return;
    }

    // Generate a random id
    let id = ``;
    for (let i = 0; i < 6; i++) id += Math.floor(Math.random() * 36).toString(36);

    // Insert the url into the database and send link
    database.prepare(`INSERT INTO url VALUES (?, ?);`).run(id, url);
    response.status(200).send(
        `<!DOCTYPE html>
<style>
    a {
        color: #000;
    }

    @media (prefers-color-scheme: dark) {
        body {
            background-color: #252525;
        }

        a {
            color: #fff;
        }
    }
</style>
<a href="//${request.headers.host}/${id}">${request.protocol}://${request.headers.host}/${id}</a>`,
    );
});

app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}.`);
});
