$(document).ready(function () {

    // keep existing draggable behavior if jQuery UI is present
    if ($.fn.draggable) {
        $(".plants").draggable();
    }

    // Delegate clicks on timeline <p> elements. Clicking a timeline entry
    // will insert or toggle a revealed <p class="timeline-blurb"> under it.
    $('#timeline').on('click', 'p', function (e) {
        var $p = $(this);

        // If the clicked element is already a blurb, do nothing here
        if ($p.hasClass('timeline-blurb')) return;

        var blurbText = $p.data('blurb') || $p.attr('id') || $p.text().trim();

        var $next = $p.next('.timeline-blurb');
        // If a blurb is already opened right after this <p>, close it
        if ($next.length) {
            $next.slideUp(150, function () { $(this).remove(); });
            return;
        }

        // Close any other open blurbs first
        $('.timeline-blurb').slideUp(150, function () { $(this).remove(); });

        // Create the blurb element and insert after the clicked <p>
        var $blurb = $('<p class="timeline-blurb" style="display:none;" tabindex="0" role="region" aria-live="polite"></p>');
        $blurb.text(blurbText);
        $p.after($blurb);
        $blurb.slideDown(150);
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

});