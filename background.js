function main () {
    console.log("________________________________");
    console.log("RT Video Finder Extension Loaded");
    console.log("________________________________");

    rtChannels = ["LetsPlay", "Rooster Teeth", "Achievement Hunter"];

    oldURL = "";

    // gets query parameters from the URL
    // (e.g. "...?a=2&b=hello" returns {a=2, b='hello'})
    //obj = getURLParams("blablabla?a=2&var2=bla")
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

        //console.log("Channel name:");
        //console.log(document.getElementById("text-container").childNodes[1].firstChild.innerText);
        // getting channel name from page and checking if it's a Rooster Teeth associated channel:
        if(existsIn(document.getElementById("text-container").childNodes[1].firstChild.innerText, rtChannels)){
            console.log("RT Channel Detected, Linking");
            
            // creating element to insert link, if not created yet or has been deleted:
            if(!document.getElementById("searchLinkContainer")){
                searchLinkContainer = document.createElement('div');
                listContainer = document.getElementById("list-container").parentElement;
                listContainer.appendChild(searchLinkContainer);
                listContainer.appendChild(listContainer.firstChild);
                listContainer.appendChild(listContainer.firstChild);
                listContainer.appendChild(listContainer.firstChild);
                searchLinkContainer.id = "searchLinkContainer";
                searchLinkContainer.margintop = "16px";
            }
            searchLinkContainer.innerHTML =
                "<h1><a href=" + 
                "https://roosterteeth.com/#search?term=" +
                ((filterAlpha(document.getElementsByTagName("h1")[0].innerText)).split(' ').join('%20')) +
                ">Search Video on RT Site</a></h1>";
        } else {
            //console.log("Non-RT Channel, Aborting");
            if(document.getElementById("searchLinkContainer")){
                //console.log("Cleaning up search link.");
                document.getElementById("searchLinkContainer").remove();
            }
            return;
        }
    }

    // starting listener loop to check if on a video watch page AND the page has loaded the necessary info
    window.setInterval(
        ()=>{
            if(oldURL == window.location.href) return;

            oldURL = window.location.href;

            //console.log("Checking for loaded element...");
            // # if "text-container" exists, then video info has been loaded
            // # if location.href includes 'watch', then user is on a video page
            //console.log("text-container exists: " + document.getElementById("text-container"));
            //console.log("on a watch page: " + window.location.href.includes('watch'));
            if(document.getElementById("text-container") && window.location.href.includes('watch')){
                intervalID = window.setInterval( // polling loop to wait for loaded info
                    ()=>{
                        if(document.getElementById("description")){ // info loaded if element with id=description exists
                            updateLink();
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