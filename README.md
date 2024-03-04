# the api does not work anymore and we do not have any motivation/intention to maintain it any further


<h1>Anime API by Anispace</h1>
    <p>Base URL: <a href="https://api.anispace.workers.dev/" target="_blank">https://api.anispace.workers.dev/</a></p>

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

