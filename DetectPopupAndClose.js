(function (element, input) {
    function isVisible(el) {
        var s = window.getComputedStyle(el);
        var r = el.getBoundingClientRect();
        return (
            s.display !== "none" &&
            s.visibility !== "hidden" &&
            parseFloat(s.opacity || "1") > 0 &&
            r.width > 20 &&
            r.height > 20
        );
    }

    function getText(el) {
        return (
            (
                el.innerText ||
                el.value ||
                el.getAttribute("aria-label") ||
                el.getAttribute("title") ||
                ""
            ) + ""
        )
            .trim()
            .toLowerCase();
    }

    var popupSelectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[class*="modal" i]',
        '[class*="popup" i]',
        '[class*="overlay" i]',
        '[class*="dialog" i]',
        '[class*="toast" i]',
        '[class*="cookie" i]',
        '[class*="banner" i]',
        '[id*="modal" i]',
        '[id*="popup" i]',
        '[id*="overlay" i]',
    ];

    var closeWords = [
        "close",
        "ok",
        "cancel",
        "x",
        "×",
        "got it",
        "no thanks",
        "not now",
        "accept",
        "agree",
        "닫기",
        "확인",
        "취소",
        "동의",
        "동의함",
        "수락",
        "허용",
        "오늘 하루 보지 않기",
        "다시 보지 않기"
    ];

    var excludeWords = [
        "count",
        "display",
        "header",
        "footer",
        "nav",
        "menu",
        "sidebar",
        "button",
        "btn",
    ];

    var popups = [];

    for (var ps = 0; ps < popupSelectors.length; ps++) {
        try {
            document.querySelectorAll(popupSelectors[ps]).forEach(function (el) {
                if (!isVisible(el)) return;
                var idStr = (el.id || "").toLowerCase();
                var classStr = (el.className || "").toLowerCase();
                for (var e = 0; e < excludeWords.length; e++) {
                    if (
                        idStr.indexOf(excludeWords[e]) !== -1 ||
                        classStr.indexOf(excludeWords[e]) !== -1
                    )
                        return;
                }
                if (popups.indexOf(el) === -1) popups.push(el);
            });
        } catch (e) { }
    }

    if (popups.length === 0) return "NONE";

    popups.sort(function (a, b) {
        return (
            (parseInt(window.getComputedStyle(b).zIndex, 10) || 0) -
            (parseInt(window.getComputedStyle(a).zIndex, 10) || 0)
        );
    });

    for (var p = 0; p < popups.length; p++) {
        var buttons = popups[p].querySelectorAll(
            'button,a,[role="button"],input[type="button"],input[type="submit"]'
        );
        for (var i = 0; i < buttons.length; i++) {
            var t = getText(buttons[i]);
            for (var j = 0; j < closeWords.length; j++) {
                if (t === closeWords[j] || t.indexOf(closeWords[j]) >= 0) {
                    buttons[i].click();
                    return "FOUND_AND_CLICKED|" + t;
                }
            }
        }
    }

    return (
        "FOUND_BUT_NO_BUTTON|" +
        (popups[0].id || popups[0].className || popups[0].tagName)
    );
});