$(document).ready(function () {

    // keep existing draggable behavior if jQuery UI is present
    if ($.fn.draggable) {
        $(".plants").draggable();
    }

    // Inline blurb: show data-blurb in a container below the wheel and push content down
    $('#timeline').on('click', 'p', function (e) {
        console.log('[blurb handler] click fired on:', this);
        var $p = $(this);
        var $timeline = $('#timeline');
        console.log('[blurb handler] checking class:', $p.attr('class'));
        if ($p.hasClass('timeline-blurb')) { console.log('[blurb handler] is blurb, returning'); return; }

        var blurbText = $p.data('blurb') || $p.attr('id') || $p.find('.tl-desc').text() || $p.text().trim();
        var year = $p.find('.tl-year').text() || '';
        var desc = $p.find('.tl-desc').text() || '';
        console.log('[blurb handler] blurbText:', blurbText, 'year:', year, 'desc:', desc);

        // ensure container exists (insert after the wheel)
        var $wheelEl = $timeline.find('.timeline-wheel');
        console.log('[blurb handler] wheel found:', $wheelEl.length);
        var $container;
        if ($wheelEl.length) {
            $container = $wheelEl.next('.timeline-blurb-container');
            console.log('[blurb handler] container after wheel:', $container.length);
            if (!$container.length) { 
                $container = $('<div class="timeline-blurb-container" style="display:none"></div>'); 
                $wheelEl.after($container); 
                console.log('[blurb handler] created container');
            }
        } else {
            $container = $timeline.find('.timeline-blurb-container');
            if (!$container.length) { $container = $('<div class="timeline-blurb-container" style="display:none"></div>'); $timeline.append($container); }
        }

        // compute index among wheel items robustly
        var $itemsList = $wheelEl.length ? $wheelEl.children('p') : $timeline.find('> p');
        var idx = $itemsList.index($p);
        console.log('[blurb handler] index:', idx, 'items count:', $itemsList.length);

        // If the same item is already open, toggle (close)
        var openId = $container.data('open-index');
        console.log('[blurb handler] openId:', openId, 'idx:', idx, 'match:', openId === idx);
        if (openId === idx) {
            console.log('[blurb handler] toggling closed');
            $container.slideUp(180, function () { $(this).empty().removeData('open-index'); });
            return;
        }

        // Close existing then open new
        console.log('[blurb handler] opening blurb');
        $container.slideUp(120, function () {
            console.log('[blurb handler] in slideUp callback');
            $container.empty().removeData('open-index');
            var $box = $('<div class="timeline-inline-blurb" style="display:none"></div>');
            var $close = $('<button class="ib-close" aria-label="Close">&times;</button>');
            $box.append($close);
            if (year) $box.append($('<div class="ib-title"></div>').text(year + (desc ? ' — ' : '') + desc));
            if (blurbText && blurbText !== desc) $box.append($('<div class="ib-body"></div>').text(blurbText));
            $container.append($box);
            console.log('[blurb handler] box created and appended');
            $container.data('open-index', idx);
            $container.slideDown(200);
            console.log('[blurb handler] container sliding down');
            $box.slideDown(220);

            $close.on('click', function () { $container.slideUp(160, function () { $(this).empty().removeData('open-index'); }); });
        });
    });

    // Clicking the blurb itself will close it
    $('#timeline').on('click', '.timeline-blurb', function (e) {
        $(this).slideUp(150, function () { $(this).remove(); });
    });

    $('#stories').on('click', 'p', function (e) {
        var $p = $(this);

        // If the clicked element is already a blurb, do nothing here
        if ($p.hasClass('stories-blurb')) return;

        var blurbText = $p.data('blurb') || $p.attr('id') || $p.text().trim();

        var $next = $p.next('.stories-blurb');
        // If a blurb is already opened right after this <p>, close it
        if ($next.length) {
            $next.slideUp(150, function () { $(this).remove(); });
            return;
        }

        // Close any other open blurbs first
        $('.stories-blurb').slideUp(150, function () { $(this).remove(); });

        // Create the blurb element and insert after the clicked <p>
        var $blurb = $('<p class="stories-blurb" style="display:none;" tabindex="0" role="region" aria-live="polite"></p>');
        $blurb.text(blurbText);
        $p.after($blurb);
        $blurb.slideDown(150);
    });

    // Clicking the blurb itself will close it
    $('#stories').on('click', '.timeline-blurb', function (e) {
        $(this).slideUp(150, function () { $(this).remove(); });
    });

    // Clicking an image inside #stories will reveal a blurb under the image
    $('#stories').on('click', 'img', function (e) {
        var $img = $(this);

        // If a blurb is already directly after this image, close it
        var $next = $img.next('.timeline-blurb');
        if ($next.length) {
            $next.slideUp(150, function () { $(this).remove(); });
            return;
        }

        // Close any other open blurbs first
        $('.timeline-blurb').slideUp(150, function () { $(this).remove(); });

        // Get blurb text from data-blurb or alt attribute
        var blurbText = $img.data('blurb') || $img.attr('alt') || '';

        var $blurb = $('<p class="timeline-blurb" style="display:none;" tabindex="0" role="region" aria-live="polite"></p>');
        $blurb.text(blurbText);
        $img.after($blurb);
        $blurb.slideDown(150);
    });

    // Timeline wheel (scroll-dial) behavior
    (function () {
        var $timeline = $('#timeline');
        if (!$timeline.length) return;

        // select all <p> inside timeline (skip any injected blurbs)
        var $ps = $timeline.find('p').not('.timeline-blurb');
        if ($ps.length < 3) return; // need a few items for wheel effect

        // Wrap all p items into a wheel container
        $ps.wrapAll('<div class="timeline-wheel" />');
        var $wheel = $timeline.find('.timeline-wheel');
        var $items = $wheel.children('p');
        var n = $items.length;
        var current = 0;
        var itemH = $items.first().outerHeight(true) || 40;
        var spacing = itemH * 1.05; // distance between items on the dial

        // normalize each item text into a year and description so years can align
        $items.each(function () {
            var $it = $(this);
            if ($it.find('.tl-year').length) return; // already processed
            var text = $it.text().trim();
            // try to split on ' -- ' which is used in the timeline, otherwise split on first ' - ' or first space after a 4-digit year
            var year = null;
            var desc = text;
            if (text.indexOf(' -- ') !== -1) {
                var parts = text.split(' -- ');
                year = parts[0].trim();
                desc = parts.slice(1).join(' -- ').trim();
            } else {
                var m = text.match(/^(\d{3,4})\b[\s-–—:]*(.*)$/);
                if (m) { year = m[1]; desc = (m[2] || '').trim(); }
            }
            if (!year) { year = ''; }
            $it.empty().append($('<span class="tl-year"/>').text(year)).append($('<span class="tl-desc"/>').text(desc));
            $it.addClass('timeline-item');
        });

        function update() {
            var containerH = $wheel.outerHeight();
            itemH = $items.first().outerHeight(true) || itemH;
            spacing = itemH * 1.05;

            $items.removeClass('center prev next');
            $items.eq(current).addClass('center');
            $items.eq((current - 1 + n) % n).addClass('prev');
            $items.eq((current + 1) % n).addClass('next');

            // 3D curved dial effect: place items around the center using modular arithmetic
            $items.each(function (i) {
                var idx = i;
                // compute signed minimal difference around the circular list
                var diff = idx - current;
                if (diff > n / 2) diff -= n;
                if (diff < -n / 2) diff += n;

                // stronger curvature/depth for pronounced 3D dial
                var angle = diff * 28; // degrees per step
                var depth = -Math.abs(diff) * 90; // translateZ negative -> push away
                var yOffset = diff * (spacing * 0.28); // vertical arc offset

                // Larger scale for the center item
                var scale = 1 - Math.min(0.18, Math.abs(diff) * 0.06);

                // base translate to center the item at the wheel's center horizontally; translateY spreads items up/down
                var base = 'translateX(-50%) translateY(' + (diff * spacing) + 'px)';

                var t = base + ' rotateX(' + angle + 'deg) translateZ(' + depth + 'px) translateY(' + (yOffset) + 'px) scale(' + scale + ')';
                $(this).css({ 'transform': t, 'opacity': 1 - Math.min(0.88, Math.abs(diff) * 0.38), 'z-index': (1000 - Math.abs(diff)) });
            });
        }

        update();

        var lock = false;
        $wheel.on('wheel', function (ev) {
            ev.preventDefault();
            if (lock) return;
            lock = true;
            var d = ev.originalEvent.deltaY;
            if (d > 0) current = (current + 1) % n; else current = (current - 1 + n) % n;
            update();
            setTimeout(function () { lock = false; }, 200);
        });

        // keyboard navigation when focus is inside timeline
        $timeline.on('keydown', function (ev) {
            if (ev.key === 'ArrowDown' || ev.key === 'PageDown') { ev.preventDefault(); current = (current + 1) % n; update(); }
            if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); current = (current - 1 + n) % n; update(); }
        });

        // clicking an item moves it to center
        $wheel.on('click', 'p', function (ev) {
            var idx = $items.index(this);
            if (idx === -1) return;
            if (idx === current) return; // already center
            current = idx;
            update();
        });

        // recompute heights on resize
        $(window).on('resize', function () { itemH = $items.first().outerHeight(true); update(); });
    })();

    /* USCIS live news fetcher: uses a public CORS proxy (AllOrigins) to fetch and parse
       the USCIS news-releases page and inject headlines/blurbs into #uscis-news. */
    function fetchUSCISNews(url, containerSelector) {
        var $container = $(containerSelector);
        if (!$container.length) return;
        var $list = $container.find('.live-news-list');
        if (!$list.length) { $container.append('<div class="live-news-list">Loading live updates…</div>'); $list = $container.find('.live-news-list'); }
        $list.text('Loading live updates…');
        var proxy = 'https://api.allorigins.win/raw?url=';
        fetch(proxy + encodeURIComponent(url)).then(function (res) {
            if (!res.ok) throw new Error('Network response not ok');
            return res.text();
        }).then(function (html) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            var items = [];
            // Look for a variety of possible list item containers
            var candidates = doc.querySelectorAll('article, .views-row, .news-release, .news-item, li');
            candidates.forEach(function (n) {
                // try to find a link and heading
                var link = n.querySelector('a') || n.querySelector('h3 a') || n.querySelector('h2 a');
                var title = '';
                var href = '';
                if (link) { title = link.textContent.trim(); href = link.href; }
                else {
                    var h = n.querySelector('h2,h3');
                    if (h) { title = h.textContent.trim(); var a = h.querySelector('a'); if (a) href = a.href; }
                }
                var blurbEl = n.querySelector('p');
                var blurb = blurbEl ? blurbEl.textContent.trim() : '';
                if (title) items.push({ title: title, href: href, blurb: blurb });
            });
            // fallback: scan headings if candidates produced nothing
            if (!items.length) {
                var headings = doc.querySelectorAll('h1,h2,h3');
                for (var i = 0; i < Math.min(8, headings.length); i++) {
                    var h = headings[i];
                    var a = h.querySelector('a');
                    var title = a ? a.textContent.trim() : h.textContent.trim();
                    var href = a ? a.href : '';
                    var p = (h.nextElementSibling && h.nextElementSibling.tagName.toLowerCase() === 'p') ? h.nextElementSibling.textContent.trim() : '';
                    if (title) items.push({ title: title, href: href, blurb: p });
                }
            }
            $list.empty();
            if (!items.length) { $list.text('No live items found.'); return; }
            items.slice(0, 8).forEach(function (it) {
                var $item = $('<div class="live-news-item"></div>');
                var $a = $('<a class="live-news-title" target="_blank" rel="noopener"></a>').attr('href', it.href || url).text(it.title);
                var $b = $('<div class="live-news-blurb"></div>').text(it.blurb);
                $item.append($a, $b);
                $list.append($item);
            });
        }).catch(function (err) {
            $list.text('Unable to load live updates: ' + err.message + '. You may need a server-side proxy or allowlist.');
        });
    }

    // Auto-start when #uscis-news exists
    if ($('#uscis-news').length) {
        fetchUSCISNews('https://www.uscis.gov/newsroom/news-releases', '#uscis-news');
    }

});