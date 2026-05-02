/**
 * GHL Lead Magnet Vetter - Global Reception Script
 * Handles UTF-8 decoding and UI injection for Hello Bars.
 * v2.1.1 - Fixed UTF-8 character encoding (dashes, emojis)
 */
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const hb = urlParams.get('hb');
  if (!hb) return;

  console.log('GHL Hello Bar: Payload detected, initializing...');

  try {
    // 1. Correct base64url to base64
    const base64 = hb.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. UTF-8 Aware Decoding (Fixes the "â —" issue)
    const json = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const data = JSON.parse(json);

    // 3. Find UI elements
    const bar = document.querySelector('[data-hello-bar]');
    const l1 = document.querySelector('[data-hello-line1]');
    const l2 = document.querySelector('[data-hello-line2]');
    const cta = document.querySelector('[data-hello-cta]');

    if (bar && data) {
      // 4. Inject Content
      if (l1) l1.innerHTML = data.l1;
      
      // Inject price pill AFTER the line 2 text
      if (l2) {
        l2.innerHTML = data.l2 + ' <span class="price-pill">' + data.p + '</span>';
      }
      
      if (cta) {
        cta.innerHTML = data.c;
      }
      
      // 5. Reveal the bar
      bar.style.display = 'block';
      
      // Update spacer if header is fixed
      const spacer = document.querySelector('.tt-header-spacer');
      if (spacer) spacer.style.display = 'block';

      console.log('GHL Hello Bar: Success');
    } else {
      console.error('GHL Hello Bar: Target elements (data-hello-*) not found in DOM.');
    }
  } catch (e) {
    console.error('GHL Hello Bar: Decoding failed.', e);
  }
})();
