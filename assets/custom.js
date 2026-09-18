var initAll = function () {
    var path = window.location.pathname;
    if (path.endsWith("/print.html")) {
        return;
    }

    // The classic mdBook template renders SUMMARY links from the book root.
    // Rebase them on nested pages, then keep canonical course.rs / BeatAI links
    // inside this classic build when the destination is part of SUMMARY.md.
    var bookRoot = new URL(path_to_root || "./", window.location.href);
    var localBookRoutes = {};
    Array.prototype.forEach.call(document.querySelectorAll("#sidebar a[href]"), function (link) {
        var rawHref = link.getAttribute("href");
        if (!rawHref || /^(?:[a-z]+:|#)/i.test(rawHref)) {
            return;
        }

        var localUrl = new URL(rawHref, bookRoot);
        link.href = localUrl.href;
        localBookRoutes[localUrl.pathname] = true;
    });

    // mdBook rebuilds the sidebar on every chapter navigation. Keep the
    // user's expanded sections so moving between chapters does not reset the
    // reading context. The key is the chapter URL, so it remains stable even
    // when the generated sidebar numbering changes.
    var expandedSidebarKey = "rust-course-expanded-sidebar";
    var sidebarToggles = document.querySelectorAll("#sidebar a.toggle");

    var chapterKey = function (toggle) {
        var chapterLink = toggle.parentElement && toggle.parentElement.querySelector("a[href]:not(.toggle)");
        if (!chapterLink) return null;
        return new URL(chapterLink.href, window.location.href).pathname;
    };

    var readExpandedSidebar = function () {
        try {
            var saved = JSON.parse(localStorage.getItem(expandedSidebarKey) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    };

    var writeExpandedSidebar = function () {
        var expanded = [];
        Array.prototype.forEach.call(sidebarToggles, function (toggle) {
            var key = chapterKey(toggle);
            if (key && toggle.parentElement.classList.contains("expanded")) {
                expanded.push(key);
            }
        });
        try {
            localStorage.setItem(expandedSidebarKey, JSON.stringify(expanded));
        } catch (error) { }
    };

    var savedExpandedSidebar = readExpandedSidebar();
    Array.prototype.forEach.call(sidebarToggles, function (toggle) {
        if (savedExpandedSidebar.indexOf(chapterKey(toggle)) !== -1) {
            toggle.parentElement.classList.add("expanded");
        }
        toggle.addEventListener("click", function () {
            // mdBook's own listener toggles the class first; save afterward.
            window.setTimeout(writeExpandedSidebar, 0);
        });
    });

    Array.prototype.forEach.call(document.querySelectorAll("main a[href]"), function (link) {
        var canonicalUrl;
        try {
            canonicalUrl = new URL(link.href);
        } catch (error) {
            return;
        }

        var targetPath;
        if (canonicalUrl.hostname === "beatai.org" &&
            (canonicalUrl.pathname === "/rust-course" || canonicalUrl.pathname.indexOf("/rust-course/") === 0)) {
            targetPath = canonicalUrl.pathname.replace(/^\/rust-course\/?/, "");
        } else if (canonicalUrl.hostname === "course.rs") {
            targetPath = canonicalUrl.pathname.replace(/^\/+/, "");
        } else {
            return;
        }

        targetPath = targetPath.replace(/\/$/, "");
        if (!targetPath) {
            targetPath = "index";
        }
        if (!targetPath.endsWith(".html")) {
            targetPath += ".html";
        }

        var localUrl = new URL(targetPath, bookRoot);
        if (!localBookRoutes[localUrl.pathname]) {
            return;
        }

        localUrl.search = canonicalUrl.search;
        localUrl.hash = canonicalUrl.hash;
        link.href = localUrl.href;
    });

    var images = document.querySelectorAll("main img")
    Array.prototype.forEach.call(images, function (img) {
        img.addEventListener("click", function () {
            BigPicture({
                el: img,
            });
        });
    });

    // Un-active everything when you click it
    Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function (el) {
        el.addEventListener("click", function () {
            Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function (el) {
                el.classList.remove("active");
            });
            el.classList.add("active");
        });
    });

    var updateFunction = function () {
        var id = null;
        var elements = document.getElementsByClassName("header");
        Array.prototype.forEach.call(elements, function (el) {
            if (window.pageYOffset >= el.offsetTop) {
                id = el;
            }
        });

        Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function (el) {
            el.classList.remove("active");
        });

        Array.prototype.forEach.call(document.getElementsByClassName("pagetoc")[0].children, function (el) {
            if (id == null) {
                return;
            }
            if (id.href.localeCompare(el.href) == 0) {
                el.classList.add("active");
            }
        });
    };

    var pagetoc = document.getElementsByClassName("pagetoc")[0];
    var elements = document.getElementsByClassName("header");
    Array.prototype.forEach.call(elements, function (el) {
        var link = document.createElement("a");

        // Indent shows hierarchy
        var indent = "";
        switch (el.parentElement.tagName) {
            case "H1":
                return;
            case "H3":
                indent = "20px";
                break;
            case "H4":
                indent = "40px";
                break;
            default:
                break;
        }

        link.appendChild(document.createTextNode(el.text));
        link.style.paddingLeft = indent;
        link.href = el.href;
        pagetoc.appendChild(link);
    });
    updateFunction.call();

    // Handle active elements on scroll
    window.addEventListener("scroll", updateFunction);

    document.getElementById("theme-list").addEventListener("click", function (e) {
        var iframe = document.querySelector('.giscus-frame');
        if (!iframe) return;
        var theme;
        if (e.target.className === "theme") {
            theme = e.target.id;
        } else {
            return;
        }

        // 若当前 mdbook 主题不是 Light 或 Rust ，则将 giscuz 主题设置为 transparent_dark
        var giscusTheme = "light"
        if (theme != "light" && theme != "rust") {
            giscusTheme = "transparent_dark";
        }

        var msg = {
            setConfig: {
                theme: giscusTheme
            }
        };
        iframe.contentWindow.postMessage({ giscus: msg }, 'https://giscus.app');
    });
    
    pagePath = pagePath.replace("index.md", "");
    pagePath = pagePath.replace(".md", "");
    if (pagePath.length > 0) {
        if (pagePath.charAt(pagePath.length-1) == "/"){
            pagePath = pagePath.substring(0, pagePath.length-1)
        }
    }else {
        pagePath = "index"
    }

    // add visitors count
    var ele = document.createElement("div");
    ele.setAttribute("align","center");
    var count = document.createElement("img")
    count.setAttribute("src", "https://visitor-badge.glitch.me/badge?page_id=" + path);
    ele.appendChild(count);
    var divider =document.createElement("hr")

    document.getElementById("giscus-container").appendChild(ele);
    document.getElementById("giscus-container").appendChild(divider);

    // 选取浏览器默认使用的语言
    // const lang = navigator.language || navigator.userLanguage

    // 若当前 mdbook 主题为 Light 或 Rust ，则将 giscuz 主题设置为 light
    var theme = "transparent_dark";
    const themeClass = document.getElementsByTagName("html")[0].className;
    if (themeClass.indexOf("light") != -1 || themeClass.indexOf("rust") != -1) {
        theme = "light"
    }

    var script = document.createElement("script")
    script.type = "text/javascript";
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "sunface/rust-course");
    script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkxNDM4MjIwNjk=");
    script.setAttribute("data-category", "章节评论区");
    script.setAttribute("data-category-id", "DIC_kwDOCJKM9c4COQcP");
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", pagePath);
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    // script.setAttribute("data-lang", lang);
    // 预先加载评论会更好，这样用户读到那边时，评论就加载好了
    // script.setAttribute("data-loading", "lazy");
    document.getElementById("giscus-container").appendChild(script);



};

window.addEventListener('load', initAll);
