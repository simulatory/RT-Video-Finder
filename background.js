console.log(window.location.href);

function main () {
    console.log("RT Video Finder Extension Loaded");

    rtChannels = ["LetsPlay", "Rooster Teeth", "Achievement Hunter", "Inside Gaming", "Funhaus", "Cow Chop"];

    oldURL = "";
    intervalID = 0;

    // returns object of query strings from the URL
    // (e.g. "...?a=2&b=hello" returns {a='2', b='hello'})
    function getURLParams(urlString){
        retObj = {};
        i = 0;
        j = 0;
        while(i < urlString.length && urlString[i] != '?') i++;
        i++;
        while(i < urlString.length){
            j = i;
            while(i < urlString.length && urlString[i] != '='){
                i++;
            }
            varName = urlString.substring(j,i);
            i++;
            j = i;
            while(i < urlString.length && urlString[i] != '&'){
                i++;
            }
            retObj[varName] = urlString.substring(j,i);
            i++;
        }
        console.log("URL parsed, returning.");
        return retObj;
    }

    function filterString(sString, filt){
        oString = "";
        for(char of sString){
            if(filt(char) || char == ' ') oString += char;
        }
        return oString;
    }

    function filterAlpha(sString){
        return filterString(
            sString,
            (c)=>{
                return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
            }
        )
    }

    function existsIn(item, array){
        for(elem of array)
            if(elem == item) return true;
        return false;
    }

    function updateLink(){
        
        console.log("updating link");
        window.clearInterval(intervalID);

        httpRequest = new XMLHttpRequest();
        httpRequest.open( "GET", "https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" +
                                 getURLParams(window.location.href).v +
                                 "&format=json", false); // synchronous request, simple but slow, shouldn't be an issue when called once per page load
        httpRequest.send( null );
        // JSON schema: {"author_url": ,"thumbnail_width": ,"width": ,"thumbnail_url": ,"version": ,"type": ,"provider_name": ,"title": ,"provider_url": ,"thumbnail_height": ,"height": ,"author_name": ,"html":}
        videoData = JSON.parse(httpRequest.responseText);
        console.log("Video Data:");
        console.log(videoData);
        if(existsIn(videoData.author_name, rtChannels)){
            console.log("RT Channel Detected, Linking");
            
            // creating element to insert link, if not created yet or has been deleted:
            if(!document.getElementById("searchLinkContainer")){
                searchLinkContainer = document.createElement('div');
                metaContentsElement = document.getElementById("meta-contents");
                metaContentsElement.parentElement.insertBefore(searchLinkContainer, metaContentsElement);
                /*
                Old method broken by YT site changes
                listContainer = document.getElementById("list-container").parentElement;
                listContainer.appendChild(searchLinkContainer);
                listContainer.appendChild(listContainer.firstChild);
                listContainer.appendChild(listContainer.firstChild);
                listContainer.appendChild(listContainer.firstChild);
                */
                searchLinkContainer.id = "searchLinkContainer";
                searchLinkContainer.margintop = "16px";
            }
            searchLinkContainer.innerHTML =
                "<h1><a href=" + 
                "https://roosterteeth.com/#search?term=" +
                ((filterAlpha(videoData.title)).split(' ').join('%20')) +
                ">Search Video on RT Site</a></h1>";
        } else {
            console.log("Non-RT Channel, Aborting");
            if(document.getElementById("searchLinkContainer")){
                console.log("Cleaning up search link.");
                document.getElementById("searchLinkContainer").remove();
            }
            return;
        }
    }

    // starting listener loop to wait for navigation change,
    // check if on video watch page,
    // and finally wait for YouTube's dynamic page to finish loading
    window.setInterval(
        ()=>{
            if(oldURL == window.location.href) return;

            oldURL = window.location.href;
            console.log("New URL: " + oldURL);

            if(window.location.href.includes('watch')){
                intervalID = window.setInterval( // polling loop to wait for page loading
                    ()=>{
                        if(document.getElementById("description")){ // page elements loaded if element with id=description exists
                            console.log("Waiting for content to load.");
                            updateLink(); // proceed
                        }
                    },
                    100
                );
            }
        },
        100
    );

}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ main +')();'));
(document.body || document.head || document.documentElement).appendChild(script);