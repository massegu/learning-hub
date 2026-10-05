window.LH_CONFIG = {
  supabaseUrl: "https://duvdwsbzrivtxgeqvsln.supabase.co",
  supabaseKey: "sb_publishable_j-4ruiZ3xma1nNJHPoROHA_-iTvSLpZ",
  stripePaymentLink: "https://buy.stripe.com/test_28E00lebW0T49RYb6R1ZS01",
  stripePortalLink:
    "https://billing.stripe.com/p/login/test_7sYfZj7NyeJUc064It1ZS00",
  stripeMode: "test",
};

(function loadV16(){
  const base=document.createElement('script');
  base.src='js/v16.js?v=16.2.0';
  base.onload=()=>{
    const next=document.createElement('script');
    next.src='js/v16_3.js?v=16.3.1';
    next.onload=()=>{
      const latest=document.createElement('script');
      latest.src='js/v16_4.js?v=16.4.0';
      latest.onload=()=>{
        const v165=document.createElement('script');
        v165.src='js/v16_5.js?v=16.5.0';
        v165.defer=true;
        document.head.appendChild(v165);
      };
      latest.defer=true;
      document.head.appendChild(latest);
    };
    next.defer=true;
    document.head.appendChild(next);
  };
  base.defer=true;
  document.head.appendChild(base);
})();
