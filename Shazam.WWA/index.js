!function () {
    "use strict";

    var INSTALLATION_ID = guid();
    var capturing;
    var listening;

    var containerElement = document.querySelector(".container");
    var pieElement = document.querySelector(".pie");
    var infoElement = document.querySelector(".info");

    setupWindow();

    var api = new ShazamCore.API();
    api.startup();

    document.querySelector(".shazam").addEventListener("click", function () {
        if (listening)
            return;

        if (!capturing) {
            api.startCapture();
            capturing = true;
        }

        listening = true;
        containerElement.classList.add("listening");
        pieElement.style.opacity = 1;
        pieElement.style.transition = "opacity 1s";

        infoElement.textContent = "Listening…";
        tag();
    });

    function tag() {
        var tagid = guid();
        var arg = {
            tag: {
                href: "https://amp.shazam.com/shazam/v3/-/-/android/-/tag/" + INSTALLATION_ID + "/" + tagid,
                minsamplems: 3000,
                maxsamplems: 20000
            },
            tagid: tagid,
            data: {
                signature: {
                    uri: "data:audio/vnd.shazam.sig;base64,{sigdata}",
                    samplems: "{samplems}"
                }
            }
        };

        api.tag(JSON.stringify(arg)).then(
            function (res) {
                try {
                    tagCallback(JSON.parse(res).tag.response.track, "No matches");
                } catch (caught) {
                    tagCallback(null, String(caught));
                }
            },
            function (error) {
                tagCallback(null, String(error));
            }
        );
    }

    function tagCallback(track, errorMessage) {
        listening = false;
        containerElement.classList.remove("listening");
        pieElement.style.opacity = 0;
        pieElement.style.transition = "none";

        if (track) {
            infoElement.innerHTML = "<a target=_blank></a><br><span style=font-size:70%></span>";
            var link = infoElement.querySelector("a");
            link.href = track.url;
            link.textContent = track.heading.title;
            infoElement.querySelector("span").textContent = track.heading.subtitle;
        } else {
            infoElement.textContent = errorMessage;
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    function setupWindow() {
        var view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
        var title = view.titleBar;

        view.setPreferredMinSize({ width: 300, height: 380 });

        title.backgroundColor
            = title.buttonBackgroundColor
            = title.inactiveBackgroundColor
            = title.buttonInactiveBackgroundColor
            = { a: 1, r: 0, g: 101, b: 187 };

        title.buttonHoverBackgroundColor
            = title.buttonPressedBackgroundColor
            = { a: 1, r: 0, g: 136, b: 255 };

        title.foregroundColor
            = title.inactiveForegroundColor
            = title.buttonForegroundColor
            = title.buttonHoverForegroundColor
            = title.buttonInactiveForegroundColor
            = Windows.UI.Colors.white;

        title.buttonPressedForegroundColor
            = Windows.UI.Colors.black;
    }
}();
