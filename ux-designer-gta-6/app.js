(() => {
  'use strict';
  const config = window.RM_CONFIG || {};
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = 'locked';
  let introFinished = false;
  let preloaderTimer;
  let profileTimer;
  let finishTimer;

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(preloaderTimer);
    const intro = $('intro');
    intro.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-intro');
    intro.classList.add('is-exiting');
    setTimeout(() => { intro.hidden = true; }, 320);
  }

  function showProfile() {
    if (state !== 'unlocking') return;
    $('landing').hidden = true;
    $('profile').hidden = false;
    $('profile-mark').hidden = false;
    $('back-home').hidden = false;
    document.body.classList.add('is-profile');
    $('profile').classList.add('is-entering');
    window.scrollTo(0, 0);
    $('profile-title').focus({ preventScroll: true });
  }

  function returnHome() {
    clearTimeout(profileTimer);
    clearTimeout(finishTimer);
    state = 'locked';
    $('profile').hidden = true;
    $('landing').hidden = false;
    $('profile-mark').hidden = true;
    $('back-home').hidden = true;
    $('landing').classList.remove('is-unlocking');
    $('profile').classList.remove('is-entering', 'is-unlocked');
    document.body.classList.remove('is-profile');
    $('unlock').focus();
  }

  function finishTransition() {
    if (state !== 'unlocking') return;
    state = 'unlocked';
    $('landing').classList.remove('is-unlocking');
    $('profile').classList.remove('is-entering');
    $('profile').classList.add('is-unlocked');
  }

  function unlockCharacter() {
    if (state !== 'locked') return;
    state = 'unlocking';
    $('landing').classList.add('is-unlocking');
    if (reduced) {
      showProfile();
      finishTransition();
      return;
    }
    profileTimer = setTimeout(showProfile, 180);
    finishTimer = setTimeout(finishTransition, 1450);
  }

  function configureLink(id, placeholderId, value, isAllowed) {
    if (!value) return;
    try {
      const url = new URL(value);
      if (!isAllowed(url)) throw new TypeError('URL não permitida para este botão.');
      const link = $(id);
      link.href = url.href;
      link.hidden = false;
      $(placeholderId).hidden = true;
    } catch (error) {
      console.error(`URL inválida em RM_CONFIG para ${id}.`, error);
    }
  }

  $('unlock').addEventListener('click', unlockCharacter);
  $('back-home').addEventListener('click', returnHome);
  $('intro-skip').addEventListener('click', finishIntro);
  if (reduced) {
    finishIntro();
  } else {
    // Match one cycle of the supplied SVG animation.
    preloaderTimer = setTimeout(finishIntro, 4200);
  }
  configureLink('linkedin', 'linkedin-placeholder', config.linkedinUrl,
    url => url.protocol === 'https:' && (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')));
  configureLink('behance', 'behance-placeholder', config.behanceUrl,
    url => url.protocol === 'https:' && (url.hostname === 'behance.net' || url.hostname.endsWith('.behance.net')));
  configureLink('contact', 'contact-placeholder', config.contactUrl,
    url => url.protocol === 'mailto:' || url.protocol === 'https:');
})();
