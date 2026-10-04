window.LH_CONFIG = {
  supabaseUrl: "https://duvdwsbzrivtxgeqvsln.supabase.co",
  supabaseKey: "sb_publishable_j-4ruiZ3xma1nNJHPoROHA_-iTvSLpZ",
  stripePaymentLink: "https://buy.stripe.com/test_28E00lebW0T49RYb6R1ZS01",
  stripePortalLink:
    "https://billing.stripe.com/p/login/test_7sYfZj7NyeJUc064It1ZS00",
  stripeMode: "test",
};

// V16 UI/localization layer. Kept separate so the core app stays easy to roll back.
(function loadV16(){
  const s=document.createElement('script');
  s.src='js/v16.js?v=16.0.0';
  s.defer=true;
  document.head.appendChild(s);
})();
