document.addEventListener("DOMContentLoaded", function () {

    const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZjI2ZjgwOTNlMzI5YTcxMjUxMjNiM2RiYzA1MmM2NyIsIm5iZiI6MTc4OTMxMTQ0Ni4wODksInN1YiI6IjZhYTZiOWQ2NWNiZTdlNDY5YTU3ODQxYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lL069Bu9s89HvLA184Yjw-HBxgmeuvVqNMz5SrjLTfk";

    const TMDB_API = "https://api.themoviedb.org/3";

    const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";


    const home = document.getElementById("home");

    const searchPage = document.getElementById("search-page");

    const homeLink = document.getElementById("home-link");

    const homeSearchForm =
        document.getElementById("home-search-form");

    const searchForm =
        document.getElementById("search-form");

    const locationButton =
        document.getElementById("location-button");

    const locationMessage =
        document.getElementById("location-message");

    const cinemasContainer =
        document.getElementById("cinemas");


    function showHome() {

        home.style.display = "block";

        searchPage.style.display = "none";

        document.getElementById("home-search").value = "";

        document.getElementById("search").value = "";

    }



    function showSearch() {

        home.style.display = "none";

        searchPage.style.display = "block";

    }



    homeLink.addEventListener("click", function (event) {

        event.preventDefault();

        showHome();

    });


    async function tmdbFetch(endpoint) {

        const response = await fetch(
            `${TMDB_API}${endpoint}`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    accept: "application/json"
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                `TMDB error: ${response.status}`
            );

        }


        return await response.json();

    }


    async function loadMoviesInCinema() {

        const movies =
            document.getElementById("movies");


        try {

            const data = await tmdbFetch(
                "/movie/now_playing" +
                "?language=pt-BR" +
                "&region=BR" +
                "&page=1"
            );


            movies.innerHTML = "";


            const moviesToShow =
                data.results.slice(0, 6);


            moviesToShow.forEach(movie => {

                const poster =
                    movie.poster_path
                        ? `${TMDB_IMAGE}${movie.poster_path}`
                        : "";


                const year =
                    movie.release_date
                        ? movie.release_date.substring(0, 4)
                        : "N/A";


                const card = document.createElement("div");

                card.className = "movie-card";


                card.innerHTML = `

                    ${
                        poster
                            ? `
                                <img
                                    src="${poster}"
                                    alt="${movie.title}"
                                >
                              `
                            : `
                                <div class="no-poster">
                                    No poster
                                </div>
                              `
                    }


                    <h3>
                        ${movie.title}
                    </h3>


                    <p>
                        ⭐ ${movie.vote_average.toFixed(1)}
                    </p>


                    <p>
                        ${year}
                    </p>


                    <button
                        class="details-button"
                        data-movie-id="${movie.id}"
                    >
                        More information
                    </button>

                `;


                movies.appendChild(card);

            });


            addDetailsEvents();

        }


        catch (error) {

            console.error(error);

            movies.innerHTML = `
                <p>
                    Could not load movies.
                </p>
            `;

        }

    }


    function addDetailsEvents() {

        const buttons =
            document.querySelectorAll(".details-button");


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const movieId =
                        this.dataset.movieId;


                    showSearch();

                    loadMovieDetails(movieId);

                }
            );

        });

    }


    async function loadMovieDetails(movieId) {

        const info =
            document.getElementById("info");


        info.innerHTML = `
            <p class="loading">
                Loading movie information...
            </p>
        `;


        try {

            const movie =
                await tmdbFetch(
                    `/movie/${movieId}?language=pt-BR`
                );


            const poster =
                movie.poster_path
                    ? `${TMDB_IMAGE}${movie.poster_path}`
                    : "";


            const genres =
                movie.genres
                    .map(genre => genre.name)
                    .join(", ");


            const runtime =
                movie.runtime
                    ? `${movie.runtime} minutes`
                    : "N/A";


            info.innerHTML = `

                ${
                    poster
                        ? `
                            <div>

                                <img
                                    src="${poster}"
                                    alt="${movie.title}"
                                >

                            </div>
                          `
                        : ""
                }


                <table>

                    <tr>
                        <th>Movie Name:</th>
                        <td>${movie.title}</td>
                    </tr>


                    <tr>
                        <th>Release Date:</th>
                        <td>${movie.release_date || "N/A"}</td>
                    </tr>


                    <tr>
                        <th>Genre:</th>
                        <td>${genres || "N/A"}</td>
                    </tr>


                    <tr>
                        <th>Runtime:</th>
                        <td>${runtime}</td>
                    </tr>


                    <tr>
                        <th>Rating:</th>
                        <td>
                            ⭐ ${movie.vote_average.toFixed(1)}
                        </td>
                    </tr>


                    <tr>
                        <th>Overview:</th>
                        <td>
                            ${movie.overview || "No overview available."}
                        </td>
                    </tr>

                </table>

            `;

        }


        catch (error) {

            console.error(error);

            info.innerHTML = `
                <p>
                    Could not load movie information.
                </p>
            `;

        }

    }


    async function searchMovie(movieName) {

        const info =
            document.getElementById("info");


        if (movieName.trim() === "") {

            info.innerHTML = `
                <p>
                    Please enter a movie name.
                </p>
            `;

            return;

        }


        info.innerHTML = `
            <p class="loading">
                Searching...
            </p>
        `;


        try {

            const data =
                await tmdbFetch(
                    `/search/movie?query=${encodeURIComponent(movieName)}` +
                    `&language=pt-BR` +
                    `&region=BR` +
                    `&page=1`
                );


            if (
                !data.results ||
                data.results.length === 0
            ) {

                info.innerHTML = `
                    <p>
                        Movie not found.
                    </p>
                `;

                return;

            }


            const movie =
                data.results[0];


            await loadMovieDetails(movie.id);

        }


        catch (error) {

            console.error(error);

            info.innerHTML = `
                <p>
                    Could not search for the movie.
                </p>
            `;

        }

    }

    homeSearchForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const movieName =
                document.getElementById(
                    "home-search"
                ).value;


            if (movieName.trim() === "") {

                return;

            }


            document.getElementById("search").value =
                movieName;


            document.getElementById(
                "home-search"
            ).value = "";


            showSearch();


            searchMovie(movieName);

        }
    );


    searchForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const movieName =
                document.getElementById("search").value;


            searchMovie(movieName);


            document.getElementById("search").value = "";

        }
    );


    locationButton.addEventListener(
        "click",
        getUserLocation
    );



    function getUserLocation() {

        if (!navigator.geolocation) {

            locationMessage.innerHTML = `
                <p class="error">
                    Your browser does not support geolocation.
                </p>
            `;

            return;

        }


        locationButton.disabled = true;

        locationButton.textContent =
            "📍 Finding your location...";


        locationMessage.innerHTML = `
            <p>
                Requesting your location...
            </p>
        `;


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                locationMessage.innerHTML = `
                    <p>
                        Location found. Searching for nearby cinemas...
                    </p>
                `;


                findNearbyCinemas(
                    latitude,
                    longitude
                );

            },


            function (error) {

                console.error(error);


                locationButton.disabled = false;

                locationButton.textContent =
                    "📍 Use my location";


                let message =
                    "Could not access your location.";


                if (error.code === 1) {

                    message =
                        "Location permission was denied.";

                }


                if (error.code === 2) {

                    message =
                        "Your location could not be determined.";

                }


                if (error.code === 3) {

                    message =
                        "Location request timed out.";

                }


                locationMessage.innerHTML = `
                    <p class="error">
                        ${message}
                    </p>
                `;

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }

        );

    }

    async function findNearbyCinemas(
        latitude,
        longitude
    ) {

        const radius = 10000;


        const query = `

            [out:json][timeout:15];

            nwr[
                "amenity"="cinema"
            ](
                around:${radius},
                ${latitude},
                ${longitude}
            );

            out center tags;

        `;


        const url =
            "https://overpass-api.de/api/interpreter" +
            "?data=" +
            encodeURIComponent(query);


        try {

            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Overpass error: ${response.status}`
                );

            }


            const data =
                await response.json();


            const cinemas =
                data.elements
                    .map(element => {

                        const cinemaLatitude =
                            element.lat ??
                            element.center?.lat;

                        const cinemaLongitude =
                            element.lon ??
                            element.center?.lon;


                        if (
                            cinemaLatitude === undefined ||
                            cinemaLongitude === undefined
                        ) {

                            return null;

                        }


                        const name =
                            element.tags?.name ||
                            "Cinema without name";


                        const distance =
                            calculateDistance(
                                latitude,
                                longitude,
                                cinemaLatitude,
                                cinemaLongitude
                            );


                        return {

                            name: name,

                            latitude:
                                cinemaLatitude,

                            longitude:
                                cinemaLongitude,

                            distance:
                                distance

                        };

                    })

                    .filter(cinema => cinema !== null)

                    .sort(
                        (a, b) =>
                            a.distance - b.distance
                    );


            displayCinemas(cinemas);

        }


        catch (error) {

            console.error(error);


            locationMessage.innerHTML = `
                <p class="error">
                    Could not find nearby cinemas.
                </p>
            `;

            locationButton.disabled = false;

            locationButton.textContent =
                "📍 Try again";

        }

    }


    function calculateDistance(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {

        const earthRadius = 6371;


        const latitudeDifference =
            toRadians(
                latitude2 - latitude1
            );


        const longitudeDifference =
            toRadians(
                longitude2 - longitude1
            );


        const a =
            Math.sin(latitudeDifference / 2) *
            Math.sin(latitudeDifference / 2) +

            Math.cos(
                toRadians(latitude1)
            ) *

            Math.cos(
                toRadians(latitude2)
            ) *

            Math.sin(longitudeDifference / 2) *
            Math.sin(longitudeDifference / 2);


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return earthRadius * c;

    }



    function toRadians(value) {

        return value * Math.PI / 180;

    }


    function displayCinemas(cinemas) {

        cinemasContainer.innerHTML = "";


        if (cinemas.length === 0) {

            locationMessage.innerHTML = `
                <p>
                    No cinemas were found within 10 km.
                </p>
            `;

            locationButton.disabled = false;

            locationButton.textContent =
                "📍 Search again";

            return;

        }


        locationMessage.innerHTML = `
            <p>
                ${cinemas.length} cinema(s) found near you.
            </p>
        `;


        const cinemasToShow =
            cinemas.slice(0, 10);


        cinemasToShow.forEach(cinema => {

            const card =
                document.createElement("div");


            card.className =
                "cinema-card";


            const distance =
                cinema.distance < 1
                    ? `${Math.round(cinema.distance * 1000)} m`
                    : `${cinema.distance.toFixed(1)} km`;


            card.innerHTML = `

                <div>

                    <h3>
                        🎬 ${cinema.name}
                    </h3>


                    <p>
                        📍 ${distance} away
                    </p>

                </div>


                <a
                    href="https://www.openstreetmap.org/?mlat=${cinema.latitude}&mlon=${cinema.longitude}#map=17/${cinema.latitude}/${cinema.longitude}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View map
                </a>

            `;


            cinemasContainer.appendChild(card);

        });


        locationButton.disabled = false;

        locationButton.textContent =
            "📍 Update my location";

    }


    showHome();

    loadMoviesInCinema();


    if ("serviceWorker" in navigator) {

        window.addEventListener(
            "load",
            function () {

                navigator.serviceWorker
                    .register("./service-worker.js")

                    .then(function () {

                        console.log(
                            "Service Worker registered successfully."
                        );

                    })

                    .catch(function (error) {

                        console.error(
                            "Service Worker registration failed:",
                            error
                        );

                    });

            }
        );

    }

});