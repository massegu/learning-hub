/* Generated artifact policy. No production destination is embedded in this file. */
(() => {
  'use strict';
  const policy = Object.freeze(__STAGING_POLICY__);
  const disabled = () => new Error('GLIAX STAGING: operation disabled');
  const destination = input => new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
  const allowed = input => {
    const url = destination(input);
    if (/\/functions\/v1\/stripe-webhook(?:\/|$)/.test(url.pathname)) return false;
    if (url.origin === location.origin) return true;
    if (location.origin !== policy.webOrigin || url.origin !== policy.apiOrigin) return false;
    return /^\/(auth|rest)\/v1(?:\/|$)/.test(url.pathname) || url.pathname === '/functions/v1/request-learning-content';
  };
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    if (!allowed(input)) return Promise.reject(disabled());
    return originalFetch(input, {...options, redirect:'error'});
  };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (!allowed(String(url))) throw disabled();
    return open.call(this, method, url, ...rest);
  };
  window.WebSocket = class { constructor() { throw disabled(); } };
  const beacon = navigator.sendBeacon?.bind(navigator);
  if (beacon) navigator.sendBeacon = (url, data) => allowed(String(url)) ? beacon(url,data) : false;
  const windowOpen = window.open.bind(window);
  window.open = (url, ...args) => destination(String(url)).origin === location.origin ? windowOpen(url,...args) : null;
  const nativeSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function() {
    if (destination(this.action).origin !== location.origin) throw disabled();
    return nativeSubmit.call(this);
  };
  document.addEventListener('submit', event => {
    if (destination(event.target.action).origin !== location.origin) event.preventDefault();
  },true);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (link && destination(link.href).origin !== location.origin) event.preventDefault();
  },true);
  function mark() {
    if (!document.body) return;
    if (!document.getElementById('gliaxStagingBanner')) {
      const banner = document.createElement('div');
      banner.id='gliaxStagingBanner'; banner.textContent='GLIAX STAGING / TEST — Sin pagos';
      banner.setAttribute('role','status');
      banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:8px;text-align:center;background:#713f12;color:white;font:700 14px sans-serif';
      document.body.prepend(banner);
      document.body.style.paddingTop='38px';
    }
    for (const id of ['subscribeBtn','billingPortalBtn']) {
      const button=document.getElementById(id);
      if (button && !button.disabled) button.disabled=true;
      if (button && !button.hidden) button.hidden=true;
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    mark();
    new MutationObserver(mark).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','disabled','class']});
  });
  window.__GLIAX_STAGING__=Object.freeze({billingEnabled:false,apiOrigin:policy.apiOrigin,webOrigin:policy.webOrigin});
})();
