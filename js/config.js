window.LH_CONFIG = {
  supabaseUrl: "https://duvdwsbzrivtxgeqvsln.supabase.co",
  supabaseKey: "sb_publishable_j-4ruiZ3xma1nNJHPoROHA_-iTvSLpZ",
  stripePaymentLink: "https://buy.stripe.com/test_28E00lebW0T49RYb6R1ZS01",
  stripePortalLink: "https://billing.stripe.com/p/login/test_7sYfZj7NyeJUc064It1ZS00",
  stripeMode: "test",
};

(function loadV16(){
  const versions=[
    ["js/v16.js","16.2.0"],
    ["js/v16_3.js","16.3.1"],
    ["js/v16_4.js","16.4.0"],
    ["js/v16_5.js","16.5.0"],
    ["js/v16_6.js","16.6.0"],
    ["js/v16_7.js","16.7.2"],
    ["js/v16_8.js","16.8.1"],
    ["js/v16_15.js","16.15.0"]
  ];
  let i=0;
  const next=()=>{
    if(i>=versions.length) return;
    const [src,v]=versions[i++];
    const s=document.createElement("script");
    s.src=`${src}?v=${v}`;
    s.onload=next;
    s.defer=true;
    document.head.appendChild(s);
  };
  next();
})();
