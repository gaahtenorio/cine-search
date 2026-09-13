const CACHE_NAME = "cinesearch-v2";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];



self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );


        self.skipWaiting();

    }
);



self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()

                .then(cacheNames => {

                    return Promise.all(

                        cacheNames

                            .filter(
                                name =>
                                    name !== CACHE_NAME
                            )

                            .map(
                                name =>
                                    caches.delete(name)
                            )

                    );

                })

        );


        self.clients.claim();

    }
);



self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(request)

                .then(cachedResponse => {

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    return fetch(request);

                })

        );

    }
);