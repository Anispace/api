import {
    getSearch,
    getAnime,
    getRecentAnime,
    getPopularAnime,
    getEpisode,
    GogoDLScrapper,
    getGogoAuthKey,
} from "./gogo";

import {
    getAnilistTrending,
    getAnilistSearch,
    getAnilistAnime,
    getAnilistUpcoming,
} from "./anilist";

let CACHE = {};
let HOME_CACHE = {};
let ANIME_CACHE = {};
let SEARCH_CACHE = {};
let REC_CACHE = {};
let RECENT_CACHE = {};
let GP_CACHE = {};
let AT_CACHE = {};

export default {
    async fetch(request, env, ctx) {
        const url = request.url;

        if (url.includes("/search/")) {
            let query, page;
            try {
                if (url.includes("?page=")) {
                    query = url.split("/search/")[1].split("?")[0];
                    page = url.split("/search/")[1].split("?page=")[1];
                } else {
                    query = url.split("/search/")[1];
                    page = 1;
                }
            } catch (err) {
                query = url.split("/search/")[1];
                page = 1;
            }

            if (SEARCH_CACHE[query + page.toString()] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = SEARCH_CACHE[`time_${query + page.toString()}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: SEARCH_CACHE[query + page.toString()],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            const data = await getSearch(query, page);
            SEARCH_CACHE[query + page.toString()] = data;
            SEARCH_CACHE[`time_${query + page.toString()}`] = Math.floor(
                Date.now() / 1000
            );
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/home")) {
            if (HOME_CACHE["data"] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = HOME_CACHE["time"];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: HOME_CACHE["data"],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            let anilistTrending = [];
            let gogoPopular = [];
            try {
                anilistTrending = (await getAnilistTrending())["results"];
            } catch (err) {
                anilistTrending = [];
                console.log(err);
            }
            try {
                gogoPopular = await getPopularAnime();
            } catch (err) {
                gogoPopular = [];
            }
            const data = { anilistTrending, gogoPopular };
            HOME_CACHE["data"] = data;
            HOME_CACHE["time"] = Math.floor(Date.now() / 1000);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/anime/")) {
            let anime = url.split("/anime/")[1];

            if (ANIME_CACHE[anime] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = ANIME_CACHE[`time_${anime}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: ANIME_CACHE[anime],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }
            let data;
            try {
                data = await getAnime(anime);
                if (data.name == "") {
                    throw new Error("Not found");
                }
                data.source = "gogoanime";
            } catch (err) {
                try {
                    // try to get by search on gogo
                    const search = await getSearch(anime);
                    anime = search[0].id;
                    data = await getAnime(anime);
                    data.source = "gogoanime";
                } catch (err) {
                    // try to get by search on anilist
                    const search = await getAnilistSearch(anime);
                    anime = search["results"][0].id;
                    data = await getAnilistAnime(anime);
                    data.source = "anilist";
                }
            }

            if (data == {}) {
                throw new Error("Not found");
            }
            ANIME_CACHE[anime] = data;
            ANIME_CACHE[`time_${anime}`] = Math.floor(Date.now() / 1000);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/episode/")) {
            const id = url.split("/episode/")[1];
            const data = await getEpisode(id);
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/download/")) {
            const query = url.split("/download/")[1];
            const timeValue = CACHE["timeValue"];
            const cookieValue = CACHE["cookieValue"];

            let cookie = "";

            if (timeValue != null && cookieValue != null) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                const timeDiff = currentTimeInSeconds - timeValue;

                if (timeDiff > 10 * 60) {
                    cookie = await getGogoAuthKey();
                    CACHE.cookieValue = cookie;
                } else {
                    cookie = cookieValue;
                }
            } else {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                CACHE.timeValue = currentTimeInSeconds;
                cookie = await getGogoAuthKey();
                CACHE.cookieValue = cookie;
            }

            const data = await GogoDLScrapper(query, cookie);

            const json = JSON.stringify({ results: data });
            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/recent/")) {
            const page = url.split("/recent/")[1];

            if (RECENT_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = RECENT_CACHE[`time_${page}`];
                if (t1 - t2 < 5 * 60) {
                    const json = JSON.stringify({
                        results: RECENT_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            const data = await getRecentAnime(page);
            const json = JSON.stringify({ results: data });

            RECENT_CACHE[page] = data;
            RECENT_CACHE[`time_${page}`] = Math.floor(Date.now() / 1000);

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/recommendations/")) {
            let anime = url.split("/recommendations/")[1];

            if (REC_CACHE[anime] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = REC_CACHE[`time_${anime}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: REC_CACHE[anime],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            const search = await getAnilistSearch(anime);
            anime = search["results"][0].id;
            let data = await getAnilistAnime(anime);
            data = data["recommendations"];
            REC_CACHE[anime] = data;
            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/gogoPopular/")) {
            let page = url.split("/gogoPopular/")[1];

            if (GP_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = GP_CACHE[`time_${page}`];
                if (t1 - t2 < 10 * 60) {
                    const json = JSON.stringify({
                        results: GP_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            let data = await getPopularAnime(page, 20);
            GP_CACHE[page] = data;

            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } else if (url.includes("/upcoming/")) {
            let page = url.split("/upcoming/")[1];

            if (AT_CACHE[page] != null) {
                const t1 = Math.floor(Date.now() / 1000);
                const t2 = AT_CACHE[`time_${page}`];
                if (t1 - t2 < 60 * 60) {
                    const json = JSON.stringify({
                        results: AT_CACHE[page],
                    });
                    return new Response(json, {
                        headers: { "Access-Control-Allow-Origin": "*" },
                    });
                }
            }

            let data = await getAnilistUpcoming(page);
            data = data["results"];
            AT_CACHE[page] = data;

            const json = JSON.stringify({ results: data });

            return new Response(json, {
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        }

        const text =
            `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime API Documentation</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        body {
            background-color: aliceblue;
            color: black;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .navbar {
            background-color: #333;
        }

        .navbar-brand, .navbar-nav .nav-link {
            color: white;
        }

        .api-info, .api-routes, .deploy-instructions {
            margin: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            color: black; /* Text color for table */
        }

        th {
            background-color: #f2f2f2;
        }

        a {
            color: #0d6efd;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg">
    <a class="navbar-brand" href="#">Anime API Documentation</a>
    <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" href="https://github.com/Apurvsikka/anime-api" target="_blank">GitHub</a>
            </li>
        </ul>
    </div>
</nav>

<div class="api-info">
    <h1>Anime API Documentation</h1>
    <p>Base URL: <a href="https://api.apurvsikka.workers.dev/" target="_blank">https://api.apurvsikka.workers.dev/</a></p>
</div>


    <div class="api-routes">
        <h2>API Routes</h2>
        <table>
            <tr>
                <th>Route</th>
                <th>Description</th>
                <th>Parameter Description</th>
            </tr>
            <tr>
                <td>/home</td>
                <td>Get trending anime from AniList and popular anime from GogoAnime</td>
                <td>None</td>
            </tr>
            <tr>
                <td>/search/{query}</td>
                <td>Search for anime by name</td>
                <td>{query}: Anime name to search</td>
            </tr>
            <tr>
                <td>/anime/{id}</td>
                <td>Get details of a specific anime</td>
                <td>{id}: GogoAnime anime ID</td>
            </tr>
            <tr>
                <td>/episode/{id}</td>
                <td>Get episode stream URLs</td>
                <td>{id}: GogoAnime episode ID</td>
            </tr>
            <tr>
                <td>/download/{id}</td>
                <td>Get episode download URLs</td>
                <td>{id}: GogoAnime episode ID</td>
            </tr>
            <tr>
                <td>/recent/{page}</td>
                <td>Get recent anime from GogoAnime</td>
                <td>{page}: Page number (1, 2, 3, ...)</td>
            </tr>
            <tr>
                <td>/recommendations/{query}</td>
                <td>Get recommendations of anime from AniList</td>
                <td>{query}: Anime name for recommendations</td>
            </tr>
            <tr>
                <td>/gogoPopular/{page}</td>
                <td>Get popular animes from GogoAnime</td>
                <td>{page}: Page number (1, 2, 3, ...)</td>
            </tr>
            <tr>
                <td>/upcoming/{page}</td>
                <td>Get upcoming animes from AniList</td>
                <td>{page}: Page number (1, 2, 3, ...)</td>
            </tr>
        </table>
    </div>


<div class="deploy-instructions">
    <h2>Deploy Your Own Copy of the API</h2>
    <ol>
        <li>Install Node.js</li>
        <li>Install and configure Wrangler in the directory
            <ul>
                <li><code>npm install wrangler</code></li>
                <li><code>npx wrangler login</code></li>
            </ul>
        </li>
        <li>Run the following commands
            <ul>
                <li><code>npm install --save npm install cheerio</code></li>
                <li><code>npm install --save npm install crypto-js</code></li>
            </ul>
        </li>
        <li>Deploy to Cloudflare Workers
            <ul>
                <li><code>npx wrangler publish</code></li>
            </ul>
        </li>
    </ol>
</div>

<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.9/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

</body>
</html>

`;
        return new Response(text, {
            headers: { "content-type": "text/html" },
        });
    },
};
