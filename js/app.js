(function () {
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
  const SUBJECT_META = {
    geometry: {
      name: "Geometría",
      icon: "△",
      desc: "Formas, propiedades y ángulos.",
    },
    language: {
      name: "Lenguaje",
      icon: "Aa",
      desc: "Comprensión, cohesión, inferencias, vocabulario y uso funcional del lenguaje.",
    },
    division: {
      name: "Divisiones",
      icon: "÷",
      desc: "Divisiones por una y dos cifras.",
    },
    reading: {
      name: "Lectura",
      icon: "▤",
      desc: "Comprensión literal e inferencial.",
    },
    middleLanguage: {
      name: "Lenguaje 12-13",
      icon: "Aa",
      desc: "Comprensión, inferencias, cohesión, pragmática y precisión lingüística.",
    },
    middleMath: {
      name: "Matemáticas 12-13",
      icon: "∑",
      desc: "Porcentajes, fracciones, ecuaciones, proporcionalidad y geometría.",
    },
    middleReading: {
      name: "Lectura 12-13",
      icon: "▤",
      desc: "Comprensión literal, inferencias y uso de evidencias.",
    },
    teenLanguage: {
      name: "Lenguaje 14-17",
      icon: "Aa",
      desc: "Argumentación, inferencias, ambigüedad, pensamiento crítico y precisión lingüística.",
    },
    teenMath: {
      name: "Matemáticas 14-17",
      icon: "∑",
      desc: "Porcentajes, ecuaciones y proporcionalidad.",
    },
    social: {
      name: "Social Lab",
      icon: "◎",
      desc: "Cognición social, perspectiva, pragmática, ambigüedad, intención e impacto.",
    },
    english: {
      name: "English Lab",
      icon: "EN",
      desc: "Inglés comunicativo, gramática, lectura y escritura ajustados al grupo de edad.",
    },
    literacy: {
      name: "Lectura + Escritura",
      icon: "✎",
      desc: "Comprensión, pensamiento crítico y escritura con temas actuales.",
    },
    attention: {
      name: "Atención",
      icon: "◉",
      desc: "Búsqueda, selección de información relevante, comparación y control de distractores.",
    },
    executive: {
      name: "Funciones ejecutivas",
      icon: "↻",
      desc: "Nivel 1: secuenciación · Nivel 2: priorización y distractores · Nivel 3: planificación con restricciones e imprevistos.",
    },
    memory: {
      name: "Memoria",
      icon: "▦",
      desc: "Listas, conversaciones, recorridos, asociaciones, encargos y memoria funcional.",
    },
    speedReasoning: {
      name: "Velocidad y razonamiento",
      icon: "◇",
      desc: "Comparación rápida, códigos, patrones, discriminación visual y razonamiento.",
    },
    applied: {
      name: "Cognición aplicada",
      icon: "◎",
      desc: "Situaciones cotidianas que integran atención, memoria y funciones ejecutivas.",
    },
  };
  const AGE = {
    primary: {
      label: "10-12 años",
      subjects: [
        "geometry",
        "language",
        "division",
        "reading",
        "english",
        "literacy",
        "attention",
        "executive",
        "memory",
        "speedReasoning",
        "applied",
      ],
    },
    middle: {
      label: "12-13 años",
      subjects: [
        "middleLanguage",
        "middleMath",
        "middleReading",
        "english",
        "literacy",
        "attention",
        "executive",
        "memory",
        "speedReasoning",
        "applied",
      ],
    },
    teen: {
      label: "14-17 años",
      subjects: [
        "teenLanguage",
        "teenMath",
        "social",
        "english",
        "literacy",
        "attention",
        "executive",
        "memory",
        "speedReasoning",
        "applied",
      ],
    },
  };
  let account = null,
    profiles = [],
    profile = null,
    state = null,
    subject = null,
    mode = "grammar",
    currentItem = null,
    counter = 0,
    requestGeneration = 0,
    guidedSession = null;
  const API = window.LearningAPI;
  const ICONS = {
    book: "📘",
    pencil: "✏️",
    backpack: "🎒",
    bottle: "🧴",
    notebook: "📓",
    folder: "📁",
    pencilCase: "🖊️",
    apple: "🍎",
    banana: "🍌",
    cup: "☕",
    bread: "🥖",
    orange: "🍊",
    strawberry: "🍓",
    headphones: "🎧",
    earbuds: "🎵",
    speaker: "🔊",
    microphone: "🎤",
    glass: "🥛",
    bowl: "🥣",
    mug: "☕",
    tomato: "🍅",
    pepper: "🫑",
    musicNote: "🎵",
    camera: "📷",
    ticket: "🎟️",
    popcorn: "🍿",
    clapper: "🎬",
    screen: "🖥️",
    suitcase: "🧳",
    map: "🗺️",
    train: "🚆",
    plane: "✈️",
    briefcase: "💼",
    keys: "🔑",
    wallet: "👛",
    phone: "📱",
    keycard: "💳",
    sandwich: "🥪",
    yogurt: "🥛",
    cookie: "🍪",
    medicine: "💊",
    milk: "🥛",
    pasta: "🍝",
    eggs: "🥚",
    juice: "🧃",
    ball: "⚽",
    doll: "🧸",
    bear: "🧸",
    car: "🚗",
    cap: "🧢",
    gift: "🎁",
  };
  const iconFor = (k) => ICONS[k] || "•";
  const safeImage = (src) =>
    src
      ? `<img class="cognitive-photo" src="${escapeHtml(src)}" alt="" loading="lazy" onerror="this.remove()">`
      : "";
  function renderIconSearch(it) {
    const visual = $("#exerciseVisual");
    const targetPair = it.targetPair
      ? `<div class="target-cue"><span>Objetivo</span><strong>${it.targetPair.map(iconFor).join(" + ")}</strong></div>`
      : "";
    const cards =
      it.type === "pairSearch"
        ? `<div class="icon-grid pair-grid">${(it.pairs || []).map((pair) => `<div class="icon-cell pair-cell">${pair.map((k) => `<span>${iconFor(k)}</span>`).join("")}</div>`).join("")}</div>`
        : `<div class="icon-grid level-${it.level || 1}">${(it.icons || []).map((k) => `<div class="icon-cell">${iconFor(k)}</div>`).join("")}</div>`;
    visual.innerHTML = targetPair + cards;
  }
  function renderMemoryExercise(it) {
    const visual = $("#exerciseVisual"),
      area = $("#exerciseOptions");
    const cards = window.ContentPolicy.forProfile(profile)
      ? `<div class="reading-passage">${window.ActivityModel.interactiveStimulus(it.stimulus,{illustrated:true,senses:it.lexicalSenses})}</div>`
      : (it.memoryContent || [])
      .map((x) =>
        x.person
          ? `<div class="memory-card"><strong>${escapeHtml(x.person)}</strong><span>${escapeHtml(x.detail)}</span></div>`
          : `<div class="memory-card"><b>${iconFor(x.icon)}</b><span>${escapeHtml(x.detail)}</span></div>`,
      )
      .join("");
    const memoryInstruction = window.ContentPolicy.forProfile(profile)
      ? "Mira bien. Después taparemos las cosas."
      : "Memoriza la información. Después desaparecerá.";
    visual.innerHTML = `<div class="memory-reveal">${cards}</div><div class="memory-timer">${memoryInstruction}</div>`;
    area.innerHTML = "";
    setTimeout(
      () => {
        if (currentItem !== it) return;
        visual.innerHTML = "";
        $("#exercisePrompt").textContent =
          it.memoryQuestion || "¿Qué recuerdas?";
        if (it.type === "memoryMulti") renderMultiSelect(it);
        else renderOptions(it);
      },
      Math.max(2500, Number(it.revealMs || 6000)),
    );
  }
  function renderMultiSelect(it) {
    $('#exerciseOptions').classList.add('structured-options');
    const selected = new Set();
    const opts = shuffle(it.opts || []);
    $("#exerciseOptions").innerHTML =
      `<div class="multi-select-grid">${opts.map((o) => `<button class="option-btn multi-option" data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div><div class="multi-actions"><span id="multiCount">0/${(it.answers || []).length} seleccionados</span><button id="multiCheck" class="primary-btn">Comprobar selección</button></div>`;
    $$("#exerciseOptions .multi-option").forEach(
      (b) =>
        (b.onclick = () => {
          const v = b.dataset.value;
          if (selected.has(v)) {
            selected.delete(v);
            b.classList.remove("selected");
          } else {
            selected.add(v);
            b.classList.add("selected");
          }
          $("#multiCount").textContent =
            `${selected.size}/${(it.answers || []).length} seleccionados`;
        }),
    );
    $("#multiCheck").onclick = () => {
      const answer = new Set((it.answers || []).map(String));
      const ok =
        selected.size === answer.size &&
        [...selected].every((v) => answer.has(v));
      $$("#exerciseOptions .multi-option").forEach((b) => {
        b.disabled = true;
        if (answer.has(b.dataset.value)) b.classList.add("correct");
        else if (selected.has(b.dataset.value)) b.classList.add("wrong");
      });
      $("#multiCheck").disabled = true;
      showFeedback(
        ok,
        saveResult(subject, ok, it.id, "memoryMulti"),
        ok
          ? "Has reconocido correctamente todos los elementos."
          : "Revisa los elementos marcados en verde.",
      );
    };
  }
  const blankState = () => {
    const subjects = profile ? ageData().subjects : [];
    const scores = {},
      levels = {};
    const initial = Math.max(
      1,
      Math.min(3, Number(profile?.progress?.initialLevel || 1)),
    );
    subjects.forEach((s) => {
      scores[s] = 0;
      levels[s] = initial;
    });
    return {
      scores,
      levels,
      totalCorrect: 0,
      totalAttempts: 0,
      history: [],
      sessions: [],
      streak: 0,
      session: {
        id: `s_${Date.now()}`,
        startedAt: new Date().toISOString(),
        attempts: 0,
        correct: 0,
      },
    };
  };
  function normalizeState(p) {
    const b = blankState(),
      s = p?.progress || {};
    return {
      ...b,
      ...s,
      scores: { ...b.scores, ...(s.scores || {}) },
      levels: { ...b.levels, ...(s.levels || {}) },
      history: s.history || [],
      sessions: s.sessions || [],
      session: b.session,
      streak: 0,
    };
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[c],
    );
  }
  function ageData() {
    if(window.AgeStages.route(profile)==='junior')return {...AGE.primary,label:'8-10 años',subjects:window.ContentPolicy.early.subjects};
    return window.ContentPolicy.forProfile(profile) || AGE[profile.age_band];
  }
  function recent(s, n = 10) {
    return state.history.filter((x) => x.subject === s).slice(-n);
  }
  function recalcLevel(s) {
    if(window.AgeStages.forProfile(profile)){
      const checkpoints=profile.progress?._levelCheckpoints || {};
      const checkpoint=checkpoints[s] || {attempt:state.totalAttempts-1};
      const results=state.history.filter(x=>x.subject===s && x.attemptNumber>checkpoint.attempt);
      const level=state.levels[s]||1,next=window.AgeStages.next(level,results,profile);
      checkpoints[s]=next!==level?{attempt:state.totalAttempts}:checkpoint;
      profile.progress={...profile.progress,_levelCheckpoints:checkpoints};state.levels[s]=next;return;
    }
    const r = recent(s, 10);
    if (r.length < 6) return;
    const acc = r.filter((x) => x.correct).length / r.length;
    let l = state.levels[s] || 1;
    if (acc >= 0.82 && l < 3) l++;
    else if (acc <= 0.42 && l > 1) l--;
    state.levels[s] = l;
  }
  async function persist() {
    if (profile && state) {
      profile.progress = {
        ...profile.progress,
        scores: state.scores,
        levels: state.levels,
        totalCorrect: state.totalCorrect,
        totalAttempts: state.totalAttempts,
        history: state.history.slice(-5000),
        sessions: state.sessions.slice(-30),
        _delivery: profile.progress?._delivery,
      };
      try {
        await API.saveProgress(profile.id, profile.progress);
      } catch (e) {
        console.warn(e);
      }
    }
  }
  function saveResult(s, correct, itemId, detail = "standard") {
    const earlyAnswer=(window.ContentPolicy.forProfile(profile)||window.AgeStages.forProfile(profile)) && currentItem?.id===itemId && s===subject;
    if(earlyAnswer && currentItem._earlyAnswered)return 0;
    if(earlyAnswer){
      currentItem._earlyAnswered=true;
      if(guidedSession?.mission){
        if(guidedSession.school)profile.progress={...profile.progress,_schoolJourney:window.SchoolJourney.record(profile.progress?._schoolJourney,s,itemId)};
        else profile.progress={...profile.progress,_earlyJourney:window.EarlyJourney.record(profile.progress?._earlyJourney,s,itemId)};
        guidedSession.answered=true;
      }
    }
    state.totalAttempts++;
    state.session.attempts++;
    if (correct) {
      state.totalCorrect++;
      state.session.correct++;
      state.streak++;
    } else state.streak = 0;
    const pts = correct
      ? 10 + (state.streak > 0 && state.streak % 3 === 0 ? 5 : 0)
      : 0;
    state.scores[s] = (state.scores[s] || 0) + pts;
    const row = {
      attemptNumber:state.totalAttempts,
      ts: new Date().toISOString(),
      sessionId: state.session.id,
      sessionStartedAt: state.session.startedAt,
      subject: s,
      correct,
      points: pts,
      level: state.levels[s] || 1,
      itemId,
      detail,
    };
    state.history.push(row);
    state.history = state.history.slice(-5000);
    recalcLevel(s);
    persist();
    API.saveResult(profile.id, row);
    updateGlobalUI();
    return pts;
  }
  function showAuth(msg = "") {
    $("#authGate").classList.remove("hidden");
    $("#appShell").classList.add("hidden");
    $("#authMessage").textContent = msg;
  }
  function hideAuth() {
    $("#authGate").classList.add("hidden");
    $("#appShell").classList.remove("hidden");
  }
  async function boot() {
    try {
      const session = await API.getSession();
      if (!session) {
        showAuth();
        return;
      }
      await loadWorkspace();
    } catch (e) {
      showAuth(e.message || "No se pudo iniciar la aplicación.");
    }
  }
  async function loadWorkspace() {
    account = await API.getAccount();
    profiles = await API.listProfiles();
    hideAuth();
    renderAccountStatus();
    if (!profiles.length) {
      renderProfiles();
      openProfileGate();
      return;
    }
    activateProfile(
      localStorage.getItem("lh_current_profile") || profiles[0].id,
    );
  }
  function renderAccountStatus() {
    const chip = $("#accountStatus");
    if (!chip) return;
    const st = account?.subscription_status || "trial";
    let txt =
      st === "trial"
        ? "Prueba 7 días"
        : st === "complimentary"
          ? "Acceso complimentary"
          : st === "active"
            ? "Suscripción activa"
            : st === "past_due"
              ? "Pago pendiente"
              : st === "cancelled"
                ? "Suscripción cancelada"
                : st;
    if (st === "trial" && account.trial_ends_at) {
      const days = Math.max(
        0,
        Math.ceil((new Date(account.trial_ends_at) - new Date()) / 86400000),
      );
      txt += ` · ${days} día${days === 1 ? "" : "s"}`;
    }
    chip.textContent = txt;
    const sub = $("#subscribeBtn"),
      portal = $("#billingPortalBtn");
    if (sub) {
      sub.textContent =
        window.LH_CONFIG?.stripeMode === "test"
          ? "Probar pago · 19,99 €/mes"
          : "Suscribirme · 19.99 €/mes";
      const canSubscribe = ["trial", "cancelled", "complimentary"].includes(st);
      sub.classList.toggle("hidden", !canSubscribe);
    }
    if (portal)
      portal.classList.toggle("hidden", !["active", "past_due"].includes(st));
  }
  function renderProfiles() {
    const sel = $("#profileSelect");
    sel.innerHTML = profiles
      .map(
        (p) =>
          `<option value="${p.id}">${escapeHtml(p.name)} · ${AGE[p.age_band].label}</option>`,
      )
      .join("");
    if (profile) sel.value = profile.id;
  }
  function openProfileGate() {
    $("#profileGate").classList.remove("hidden");
    $("#newProfileName").focus();
  }
  function closeProfileGate() {
    $("#profileGate").classList.add("hidden");
  }
  async function createProfile() {
    const name = $("#newProfileName").value.trim();
    if (!name) return;
    try {
      const p = await API.createProfile(
        name,
        $("#newProfileAge").value,
        $("#newProfileLevel").value,
        "es_intl",
      );
      profiles.push(p);
      $("#newProfileName").value = "";
      closeProfileGate();
      activateProfile(p.id);
    } catch (e) {
      alert(e.message);
    }
  }
  function activateProfile(id) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    profile = p;
    guidedSession=null;
    hideGuidedBar();
    $('#appShell').classList.toggle('early-experience',Boolean(window.ContentPolicy.forProfile(p)));
    $('#appShell').classList.toggle('school-experience',Boolean(window.SchoolJourney.forProfile(p)));
    $('#appShell').dataset.ageTheme=window.SchoolJourney.forProfile(p)?.theme || '';
    $('#exercise').classList.toggle('early-primary',Boolean(window.ContentPolicy.forProfile(p)));
    API.profileLocale = p.locale;
    currentItem = null;
    requestGeneration++;
    localStorage.setItem("lh_current_profile", id);
    state = normalizeState(p);
    subject = ageData().subjects[0];
    mode = "grammar";
    counter = 0;
    renderProfiles();
    buildNavigation();
    buildHomework();
    buildSessionBuilder();
    switchSection("home");
    updateGlobalUI();
  }
  function buildNavigation() {
    const nav = $("#navMenu");
    const items = [["home", "⌂", "Inicio"]];
    ageData().subjects.forEach((s) =>
      items.push(["exercise", SUBJECT_META[s].icon, SUBJECT_META[s].name, s]),
    );
    items.push(
      ["sessionBuilder", "▦", "Crear sesión"],
      ["progress", "↗", "Progreso"],
      ["homework", "⇩", "Fichas"],
    );
    nav.innerHTML = items
      .map(
        (x, i) =>
          `<button class="nav-item ${i === 0 ? "active" : ""}" data-section="${x[0]}" ${x[3] ? `data-subject="${x[3]}"` : ""}>${x[1]} ${window.ContentPolicy.forProfile(profile)&&x[3]?window.EarlyJourney.areas[x[3]].title:x[2]}</button>`,
      )
      .join("");
    $$(".nav-item").forEach(
      (b) =>
        (b.onclick = () => {
          if (b.dataset.subject) {
            guidedSession = null;
            hideGuidedBar();
            subject = b.dataset.subject;
            switchSection("exercise");
            setupExercise();
          } else switchSection(b.dataset.section);
        }),
    );
  }
  const titles = {
    home: "Panel",
    exercise: "Entrenamiento",
    division: "Divisiones",
    sessionBuilder: "Crear sesión",
    progress: "Progreso",
    homework: "Fichas para casa",
  };
  function switchSection(id) {
    $$(".section").forEach((s) => s.classList.remove("active-section"));
    $("#" + id).classList.add("active-section");
    $$(".nav-item").forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.section === id &&
          (!b.dataset.subject || b.dataset.subject === subject),
      ),
    );
    $("#sectionTitle").textContent =
      id === "exercise" ? SUBJECT_META[subject].name : titles[id];
    if (id === "progress") renderProgress();
    if(id==='home')renderEarlyHub();
    if(id==='home')renderSchoolHub();
  }
  function setupExercise() {
    const m = SUBJECT_META[subject];
    $("#exercisePill").textContent = m.name.toUpperCase();
    $("#exerciseHeading").textContent = m.name;
    $("#exerciseDescription").textContent = m.desc;
    if (window.ContentPolicy.forProfile(profile)) {
      $('#exerciseHeading').textContent=window.EarlyJourney.areas[subject].title;
      const descriptions = {
        language: "Juega con las palabras, las letras y las frases.",
        division: "Cuenta y resuelve problemas con cosas que conoces.",
        reading: "Lee una historia corta y responde.",
        attention: "Mira con calma y busca lo que te pedimos.",
        executive: "Piensa qué hacer y ordena los pasos.",
        memory: "Mira las cosas e intenta recordarlas.",
        speedReasoning: "Busca parejas y descubre qué viene después.",
        applied: "Piensa qué puedes hacer en cada situación.",
      };
      $("#exerciseDescription").textContent = descriptions[subject];
    }
    $("#exerciseLevelSelect").value = String(state.levels[subject] || 1);
    $("#subjectScore").textContent = state.scores[subject] || 0;
    const isLang = ["language","middleLanguage"].includes(subject);
    $$('.language-mode-btn').forEach(b=>{
      b.textContent=window.ContentPolicy.forProfile(profile)?({grammar:'Palabras y gramática',spelling:'Ortografía',writing:'Formar frases'})[b.dataset.mode]:({grammar:'Gramática',spelling:'Ortografía',writing:'Escritura'})[b.dataset.mode];
      b.classList.toggle('active',b.dataset.mode===mode);
    });
    $("#languageModeSwitch").classList.toggle("hidden", !isLang);
    counter = 0;
    renderEarlyTaskGuide();
    renderSchoolTaskGuide();
    newExercise();
  }
  async function requestForProfile(payload, targetProfile = profile) {
    const locale = API.effectiveLocale(targetProfile);
    const localeRevision = API.localeRevision;
    const res = await API.requestContent({
      ...payload,
      profile_id: targetProfile.id,
      locale,
    });
    if (localeRevision !== API.localeRevision) throw new Error('La variante de español ha cambiado. Solicita contenido nuevo.');
    if (res?.error) throw new Error(typeof res.error === 'string' ? res.error : res.error.message || 'No se pudo cargar el contenido.');
    // Server authentication, subscription checks and usage accounting happen
    // first. The browser never supplies local content after a rejected call.
    const worksheet=payload.kind==='worksheet';
    const selected = window.EarlyContent.adaptResponse(res, payload, targetProfile, worksheet?{
      accept:(item,domain)=>window.WorksheetSelection.compatible(item,targetProfile,locale,domain),
    }:{});
    // Worksheet candidates are localized/validated individually by the selector.
    // One unprintable or unlocalizable remote item must not abort the whole batch.
    if(!worksheet){
      selected.items = selected.items.map((item, i) => window.LocaleContent.localizeItem(
        item, locale, payload.domains ? payload.domains[i % payload.domains.length] : payload.domain,
      ));
      if (window.ContentPolicy.forProfile(targetProfile)) {
        selected.items.forEach((item, i) => window.ActivityModel.forDelivery(
          item, targetProfile, payload.domains ? payload.domains[i % payload.domains.length] : payload.domain,
        ));
      }
    }
    if (window.ContentPolicy.forProfile(targetProfile)) {
      await API.saveProgress(targetProfile.id, targetProfile.progress);
    }
    return selected;
  }
  async function requestOne(kind, domain = subject, extra = {}) {
    const res = await requestForProfile({
      kind,
      domain,
      subdomain: ["language","middleLanguage"].includes(domain) ? mode : null,
      level: state.levels[domain] || 1,
      count: 1,
      ...extra,
    });
    if (res?.usage) {
      $("#usageHint").textContent =
        `Uso hoy: ${res.usage.used}/${res.usage.limit} ${kind === "worksheet" ? "fichas" : kind === "game" ? "juegos" : "ejercicios"}`;
    }
    return res?.items?.[0] || null;
  }
  async function newExercise() {
    $('#exerciseLevelSelect').value=String(state.levels[subject]||1);
    const requestedProfile = profile;
    const requestedSubject = subject;
    const generation = ++requestGeneration;
    currentItem = null;
    $("#exerciseOptions").innerHTML = "";
    $("#exerciseOptions").classList.remove('structured-options');
    $("#exerciseVisual").innerHTML = "";
    $("#exerciseTopic").textContent = "";
    $("#exerciseTopic").classList.add("hidden");
    $("#exerciseFeedback").textContent = "";
    $("#exerciseExplanation").textContent = "";
    $("#exerciseExplanation").classList.add("hidden");
    $("#textAnswerArea").classList.add("hidden");
    $("#selfAssessment").classList.add("hidden");
    $("#textAnswerInput").value = "";
    $("#modelAnswer").textContent = "";
    $("#exerciseNext").classList.add("hidden");
    if(window.ContentPolicy.forProfile(profile))$('#exerciseNext').textContent='Siguiente →';
    setLoading(true);
    try {
      const item = await requestOne("exercise");
      if (profile !== requestedProfile || subject !== requestedSubject || generation !== requestGeneration) return;
      currentItem = item;
      counter++;
      renderExercise(currentItem);
    } catch (e) {
      if (profile === requestedProfile && subject === requestedSubject && generation === requestGeneration) showContentError(e);
    } finally {
      setLoading(false);
    }
  }
  function setLoading(v) {
    if (v) $("#exercisePrompt").textContent = "Cargando reto…";
  }
  function friendlyContentError(e) {
    const raw = String(e?.message || "");
    if (/Daily content limit reached/i.test(raw))
      return "Has alcanzado el límite de contenido de hoy para esta modalidad. Podrás continuar cuando se renueve la cuota diaria.";
    if (/Trial expired/i.test(raw))
      return "El periodo de prueba ha finalizado.";
    if (/non-2xx|Failed to send|Edge Function/i.test(raw))
      return "No se pudo cargar el contenido. Inténtalo de nuevo en unos segundos.";
    return raw || "No se pudo cargar el contenido.";
  }
  function showContentError(e) {
    const msg = friendlyContentError(e);
    $("#exercisePrompt").textContent = msg;
    $("#exerciseOptions").innerHTML = "";
    $("#exerciseOptions").classList.remove('structured-options');
    $("#exerciseVisual").innerHTML = "";
    $("#exerciseNext").classList.add("hidden");
  }
  function renderExercise(it) {
    if (!it) {
      $("#exercisePrompt").textContent = "No hay contenido disponible.";
      return;
    }
    it = window.LocaleContent.localizeItem(it, API.effectiveLocale(profile), subject);
    window.lastDifficultyAudit=window.AgeStages.audit(it,profile,state.levels[subject]||1);
    currentItem = it;
    window.ActivityModel.forDelivery(it, profile, subject);
    $("#exerciseCounter").textContent = `Ejercicio ${counter}`;
    $("#exerciseFeedback").textContent = "";
    $("#exerciseFeedback").className = "feedback";
    $("#exerciseExplanation").classList.add("hidden");
    $("#exerciseNext").classList.add("hidden");
    $("#exerciseOptions").innerHTML = "";
    $("#exerciseVisual").innerHTML = "";
    $("#textAnswerArea").classList.add("hidden");
    $("#selfAssessment").classList.add("hidden");
    $("#exerciseTopic").textContent = it.topic || it.theme || "";
    $("#exerciseTopic").classList.toggle(
      "hidden",
      !$("#exerciseTopic").textContent,
    );
    if (it.visual)
      $("#exerciseVisual").innerHTML =
        `<div class="shape-visual">${it.visual}</div>`;
    if (it.angle !== undefined)
      $("#exerciseVisual").innerHTML =
        `<div class="angle-box"><strong>${it.angle}°</strong></div>`;
    if (it.title && it.text)
      $("#exerciseVisual").innerHTML =
        `<div class="reading-passage"><h4>${escapeHtml(it.title)}</h4><p>${escapeHtml(it.text)}</p></div>`;
    if (it.type === "visualSearch" && Array.isArray(it.grid))
      $("#exerciseVisual").innerHTML =
        `<div class="symbol-grid">${it.grid.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div>`;
    if (it.type === "sceneAttention" && it.image)
      $("#exerciseVisual").innerHTML = safeImage(it.image);
    if (it.type === "iconSearch" || it.type === "pairSearch")
      renderIconSearch(it);
    if (it.model)
      $("#exerciseVisual").innerHTML =
        `<div class="code-model"><span>MODELO</span><strong>${escapeHtml(it.model)}</strong></div>`;
    if (Array.isArray(it.modelSequence))
      $("#exerciseVisual").innerHTML =
        `<div class="code-model"><span>MODELO</span><strong>${it.modelSequence.map(escapeHtml).join(" &nbsp; ")}</strong></div>`;
    if (Array.isArray(it.rows))
      $("#exerciseVisual").innerHTML +=
        `<div class="pattern-rows">${it.rows.map((r, i) => `<div><b>Fila ${i + 1}</b><span>${r.map(escapeHtml).join(" &nbsp; ")}</span></div>`).join("")}</div>`;
    if (Array.isArray(it.visualItems))
      $("#exerciseVisual").innerHTML +=
        `<div class="v13-visual-items">${it.visualItems.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div>`;
    if (it.scenario)
      $("#exerciseVisual").innerHTML +=
        `<div class="scenario-card"><span class="scenario-label">SITUACIÓN</span><p>${escapeHtml(it.scenario)}</p></div>`;
    if (it.stimulus)
      $("#exerciseVisual").innerHTML =
        `<div class="reading-passage">${window.ActivityModel.interactiveStimulus(it.stimulus,{illustrated:Boolean(window.ContentPolicy.forProfile(profile)),senses:it.lexicalSenses})}</div>`;
    $("#exercisePrompt").textContent = it.q || "Actividad";
    if (it.type === "memoryReveal" || it.type === "memoryMulti") {
      renderMemoryExercise(it);
      return;
    }
    if (it.type === "self" || (!it.opts && !it.a && it.sample)) {
      $("#textAnswerArea").classList.remove("hidden");
      $("#textAnswerInput").value = "";
      return;
    }
    if (it.type === "order") {
      renderOrderExercise(it);
      return;
    }
    if (it.type === "sequence" || it.type === "ruleSwitch") {
      renderCognitiveExercise(it);
      return;
    }
    renderOptions(it);
  }
  function renderOptions(it) {
    $('#exerciseOptions').classList.remove('structured-options');
    const opts = shuffle(it.opts || []);
    const illustrated=Boolean(window.ContentPolicy.forProfile(profile)) && opts.every(o=>window.StimulusArt.forLabel(o,it.lexicalSenses)||/^[●○□△☆\s·]+$/.test(o));
    $("#exerciseOptions").innerHTML = opts
      .map((o) => `<button class="option-btn" data-answer="${escapeHtml(o)}" aria-label="${escapeHtml(o)}">${illustrated?window.ActivityModel.visualLabel(o,it.lexicalSenses):escapeHtml(o)}</button>`)
      .join("");
    $$("#exerciseOptions .option-btn").forEach(
      (b) => (b.onclick = () => checkOption(b, b.dataset.answer)),
    );
  }
  function checkOption(btn, value) {
    const correct = value === String(currentItem.a);
    $$("#exerciseOptions .option-btn").forEach((b) => {
      b.disabled = true;
      if (b.dataset.answer === String(currentItem.a)) b.classList.add("correct");
    });
    if (!correct) btn.classList.add("wrong");
    const pts = saveResult(
      subject,
      correct,
      currentItem.id,
      currentItem.type || "standard",
    );
    showFeedback(correct, pts, currentItem.why);
  }
  function renderOrderExercise(it) {
    const tokens = [...(it.tokens || [])],
      expected = Array.isArray(it.answer)
        ? it.answer
        : [String(it.answer || "")];
    const picked = [];
    const area = $("#exerciseOptions");
    area.classList.add('structured-options');
    const render = () => {
      const slots = expected
        .map(
          (_, i) =>
            `<button class="sequence-slot ${picked[i] ? "filled" : ""}" data-slot="${i}"><span>${i + 1}</span>${picked[i] ? escapeHtml(picked[i]) : "Selecciona un paso"}</button>`,
        )
        .join("");
      const tray = tokens
        .map(
          (tok, i) =>
            `<button class="word-token ${picked.includes(tok) ? "used" : ""}" data-token-index="${i}" ${picked.includes(tok) ? "disabled" : ""}>${escapeHtml(tok)}</button>`,
        )
        .join("");
      area.innerHTML = `<div class="sequence-workspace"><div class="sequence-slots">${slots}</div><div class="token-bank"><p class="eyebrow">PASOS DISPONIBLES</p><div class="token-tray">${tray}</div></div></div><div class="sequence-actions"><button id="orderUndo" class="secondary-btn" ${picked.length ? "" : "disabled"}>Deshacer</button><button id="orderReset" class="ghost-light-btn" ${picked.length ? "" : "disabled"}>Reiniciar</button><button id="orderCheck" class="primary-btn">Comprobar</button></div>`;
      $$("#exerciseOptions .word-token").forEach(
        (b) =>
          (b.onclick = () => {
            const tok = tokens[Number(b.dataset.tokenIndex)];
            if (!picked.includes(tok) && picked.length < expected.length) {
              picked.push(tok);
              render();
            }
          }),
      );
      $$("#exerciseOptions .sequence-slot.filled").forEach(
        (b) =>
          (b.onclick = () => {
            const i = Number(b.dataset.slot);
            picked.splice(i, 1);
            render();
          }),
      );
      $("#orderUndo").onclick = () => {
        picked.pop();
        render();
      };
      $("#orderReset").onclick = () => {
        picked.length = 0;
        render();
      };
      $("#orderCheck").onclick = () => {
        const ok =
          picked.length === expected.length &&
          picked.every((x, i) => x === expected[i]);
        showFeedback(
          ok,
          saveResult(subject, ok, it.id, "planning"),
          ok
            ? "Secuencia correcta."
            : `Orden esperado: ${expected.join(" → ")}`,
        );
      };
    };
    render();
  }
  function renderCognitiveExercise(it) {
    const area = $("#exerciseOptions");
    area.classList.add('structured-options');
    if (it.type === "sequence") {
      area.innerHTML = `<button class="primary-btn" id="showSeq">Mostrar secuencia</button><div id="seqButtons" class="game-quick-grid"></div>`;
      $("#showSeq").onclick = () => {
        const seq = it.sequence || [];
        $("#showSeq").textContent = seq.join(" · ");
        setTimeout(() => {
          $("#showSeq").textContent = "Ahora repítela";
          const picked = [];
          $("#seqButtons").innerHTML = [1, 2, 3, 4]
            .map((n) => `<button class="game-choice">${n}</button>`)
            .join("");
          $$("#seqButtons button").forEach(
            (b) =>
              (b.onclick = () => {
                picked.push(Number(b.textContent));
                if (picked.length === seq.length) {
                  const ok = picked.every((x, i) => x === seq[i]);
                  showFeedback(
                    ok,
                    saveResult(subject, ok, it.id, "workingMemory"),
                  );
                }
              }),
          );
        }, 1800);
      };
    } else {
      let i = 0,
        okCount = 0;
      const render = () => {
        const r = it.rounds[i];
        area.innerHTML = `<div class="rule-card"><strong>${escapeHtml(r.rule)}</strong><div class="prompt">${r.n}</div><button class="game-choice" data-v="true">Sí</button><button class="game-choice" data-v="false">No</button></div>`;
        $$("#exerciseOptions button").forEach(
          (b) =>
            (b.onclick = () => {
              if ((b.dataset.v === "true") === Boolean(r.a)) okCount++;
              i++;
              if (i < it.rounds.length) render();
              else {
                const ok = okCount >= Math.ceil(it.rounds.length * 0.75);
                showFeedback(
                  ok,
                  saveResult(subject, ok, it.id, "ruleSwitch"),
                  `${okCount}/${it.rounds.length} respuestas correctas`,
                );
              }
            }),
        );
      };
      render();
    }
  }
  function showFeedback(correct, pts, why = "") {
    const f = $("#exerciseFeedback");
    f.textContent =
      why ||
      (correct
        ? `Correcto · +${pts} puntos`
        : `No esta vez. Respuesta: ${currentItem.a || "revisa el modelo"}`);
    f.className = "feedback " + (correct ? "ok" : "bad");
    $("#exerciseNext").classList.remove("hidden");
    if(window.ContentPolicy.forProfile(profile)||window.AgeStages.forProfile(profile)){
      $$('#exerciseOptions button').forEach(b=>b.disabled=true);
      $('#exerciseNext').textContent=guidedSession?.mission && guidedSession.index===guidedSession.plan.length-1?'Terminar misión →':'Siguiente →';
      renderEarlyTaskGuide(true);
    }
  }
  $("#exerciseNext").onclick = () => {
    if (guidedSession) {
      advanceGuidedSession();
    } else newExercise();
  };
  $$(".language-mode-btn").forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.mode;
        $$(".language-mode-btn").forEach((x) =>
          x.classList.toggle("active", x === b),
        );
        newExercise();
      }),
  );
  $("#textAnswerCheck").onclick = () => {
    $("#modelAnswer").textContent =
      currentItem.sample ||
      currentItem.a ||
      "Revisa si tu respuesta responde con claridad.";
    $("#selfAssessment").classList.remove("hidden");
  };
  $$(".self-buttons button").forEach(
    (b) =>
      (b.onclick = () => {
        const ok = b.dataset.self === "true";
        showFeedback(ok, saveResult(subject, ok, currentItem.id, "self"));
      }),
  );
  function updateGlobalUI() {
    if (!profile) return;
    const total = Object.values(state.scores).reduce(
      (a, b) => a + Number(b || 0),
      0,
    );
    if ($("#gamesScore"))
      $("#gamesScore").textContent = state.scores.games || 0;
    if ($("#subjectScore") && subject)
      $("#subjectScore").textContent = state.scores[subject] || 0;
    $("#globalScore").textContent = total;
    $("#homePoints").textContent = total;
    $("#homeCorrect").textContent = state.totalCorrect;
    $("#homeAttempts").textContent = state.totalAttempts;
    $("#homeAccuracy").textContent =
      (state.totalAttempts
        ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
        : 0) + "%";
    $("#streakCount").textContent = state.streak;
    $("#sessionAttempts").textContent = state.session.attempts;
    $("#activeProfileLabel").textContent = profile.name;
    $("#ageEyebrow").textContent =
      `${AGE[profile.age_band].label} · ${window.LocaleContent.labels[API.effectiveLocale(profile)]}`;
    renderHomeLevels();
    renderEarlyHub();
    renderEarlyTaskGuide();
    renderSchoolHub();
    renderSchoolTaskGuide();
  }
  function missionDefinition(){return (guidedSession?.school?window.SchoolJourney:window.EarlyJourney).definition(guidedSession?.mission);}
  function startSchoolMission(id){
    if(!window.SchoolJourney.forProfile(profile))return;
    const saved=window.SchoolJourney.start(profile.progress?._schoolJourney,id);
    profile.progress={...profile.progress,_schoolJourney:saved};
    const mission=window.SchoolJourney.definition(saved.active.id);
    guidedSession={school:true,mission:mission.id,plan:mission.plan,index:saved.active.index,answered:false};
    subject=mission.plan[saved.active.index];persist();switchSection('exercise');updateGuidedBar();setupExercise();
  }
  function renderSchoolHub(){
    const hub=$('#schoolHub'),stage=window.SchoolJourney.forProfile(profile);
    hub.classList.toggle('hidden',!stage);if(!stage||!state)return;
    const journey=window.SchoolJourney,saved=journey.normalize(profile.progress?._schoolJourney),active=saved.active;
    const domains=ageData().subjects,suggested=$('#recommendedBtn').dataset.subject;
    const next=active?journey.definition(active.id).plan[active.index]:domains.includes(suggested)?suggested:domains[0];
    hub.innerHTML=`<div class="school-hero card"><div><p class="eyebrow">LEARNING LAB · ${stage.label}</p><h3>${stage.title}</h3><p>${stage.description}</p><button id="schoolContinue" class="primary-btn">${active?'Continuar misión':'Explorar '+journey.all[next].title} →</button></div><div class="school-summary"><strong>${state.totalAttempts}</strong><span>actividades realizadas</span><small>${saved.completed.length} misiones completadas</small></div></div><div class="hub-heading"><h3>Áreas de entrenamiento</h3><span>Acceso directo o misiones de 3 a 5 actividades</span></div><div class="school-area-grid">${domains.map(domain=>{
      const area=journey.all[domain],results=state.history.filter(x=>x.subject===domain);
      return `<button class="school-area-card card" data-school-area="${domain}"><span class="school-icon" aria-hidden="true">${window.StimulusArt.svg(area.icon)}</span><span><strong>${area.title}</strong><small>${results.length} actividades · nivel ${state.levels[domain]||1}</small></span><span aria-hidden="true">→</span></button>`;
    }).join('')}</div><div class="hub-heading"><h3>Misiones</h3><span>El progreso se guarda con tu perfil.</span></div>${active?`<p class="mission-resume">${journey.definition(active.id).title}: ${active.index} actividades realizadas.</p>`:''}<div class="school-mission-grid">${journey.missions.map(m=>`<div class="school-mission-card card"><h4>${m.title}</h4><p>${m.plan.length} actividades · ${[...new Set(m.plan)].map(d=>journey.all[d].title).join(', ')}</p><button class="secondary-btn" data-school-mission="${m.id}" ${active&&active.id!==m.id?'disabled':''}>${active?.id===m.id?'Continuar':'Empezar'} →</button></div>`).join('')}</div>`;
    function open(domain){guidedSession=null;hideGuidedBar();subject=domain;switchSection('exercise');setupExercise();}
    $('#schoolContinue').onclick=()=>active?startSchoolMission(active.id):open(next);
    $$('[data-school-area]').forEach(b=>b.onclick=()=>open(b.dataset.schoolArea));
    $$('[data-school-mission]').forEach(b=>b.onclick=()=>startSchoolMission(b.dataset.schoolMission));
  }
  function renderSchoolTaskGuide(){
    let guide=$('#schoolTaskGuide');
    if(!guide){guide=document.createElement('div');guide.id='schoolTaskGuide';guide.className='school-task-guide';$('.exercise-card').prepend(guide);}
    const stage=window.SchoolJourney.forProfile(profile);guide.classList.toggle('hidden',!stage);if(!stage)return;
    guide.innerHTML=`<button id="schoolHomeBtn" class="secondary-btn">← Mis áreas</button><span>${window.SchoolJourney.all[subject]?.title||'Actividad'} · ${state.history.filter(x=>x.subject===subject).length} actividades realizadas</span>`;
    $('#schoolHomeBtn').onclick=()=>{guidedSession=null;hideGuidedBar();switchSection('home');};
  }
  function journeyState(){return window.EarlyJourney.normalize(profile?.progress?._earlyJourney);}
  function openEarlyArea(domain){
    if(!window.ContentPolicy.forProfile(profile)||!ageData().subjects.includes(domain))return;
    guidedSession=null;hideGuidedBar();subject=domain;switchSection('exercise');setupExercise();
  }
  function startEarlyMission(id){
    if(!window.ContentPolicy.forProfile(profile))return;
    profile.progress={...profile.progress,_earlyJourney:window.EarlyJourney.start(profile.progress?._earlyJourney,id)};
    const active=journeyState().active,mission=window.EarlyJourney.definition(active.id);
    guidedSession={mission:active.id,plan:mission.plan,index:active.index,answered:false};
    subject=mission.plan[active.index];persist();switchSection('exercise');updateGuidedBar();setupExercise();
  }
  function renderEarlyHub(){
    const hub=$('#earlyHub'),early=Boolean(window.ContentPolicy.forProfile(profile));
    hub.classList.toggle('hidden',!early);if(!early||!state)return;
    const journey=window.EarlyJourney,stats=journey.stats(state.history),saved=journeyState(),active=saved.active;
    const suggested=$('#recommendedBtn').dataset.subject;
    const next=active?journey.definition(active.id).plan[active.index]:journey.areas[suggested]?suggested:'language';
    const explored=Object.values(stats).filter(x=>x.attempts>=3).length;
    hub.innerHTML=`<div class="explore-welcome card"><div><p class="eyebrow">LEARNING LAB · MIS DESCUBRIMIENTOS</p><h3>Un lugar para explorar</h3><p>Elige un área o prueba una misión corta. Vamos paso a paso.</p><button id="earlyContinue" class="primary-btn">${active?'Continuar misión':'Explorar '+journey.areas[next].title} →</button></div><div class="explore-summary"><span class="hub-illustration" aria-hidden="true">${window.StimulusArt.svg('backpack')}</span><strong>${explored} de 8 áreas exploradas</strong><span>${state.totalAttempts} actividades realizadas</span><small>Tres actividades para explorar un área.</small></div></div>
      <div class="hub-heading"><div><p class="eyebrow">ELIGE TU CAMINO</p><h3>Mis áreas</h3></div><span>También puedes entrar desde el menú.</span></div>
      <div class="early-area-grid">${Object.entries(journey.areas).map(([domain,area])=>`<button class="early-area-card card" data-early-area="${domain}"><span class="area-illustration" aria-hidden="true">${window.StimulusArt.svg(area.icon)}</span><span class="area-copy"><small>${area.theme}</small><strong>${area.title}</strong><span>${area.description}</span><span class="area-progress" aria-label="Primera exploración: ${stats[domain].firstExploration} de 3 actividades">${[1,2,3].map(i=>`<i class="${stats[domain].firstExploration>=i?'done':''}" aria-hidden="true"></i>`).join('')}<small>${stats[domain].attempts} actividades · nivel ${state.levels[domain]||1}</small></span></span><span aria-hidden="true">→</span></button>`).join('')}</div>
      <div class="hub-heading"><div><p class="eyebrow">PASO A PASO</p><h3>Misiones cortas</h3></div><span>${saved.completed.length} misiones terminadas</span></div>
      ${active?`<p class="mission-resume" role="status">${journey.definition(active.id).title}: ${active.index} de ${journey.definition(active.id).plan.length} actividades realizadas. Puedes continuar cuando quieras.</p>`:''}
      <div class="early-mission-grid">${journey.missions.map(m=>`<div class="mission-card card"><span aria-hidden="true">${window.StimulusArt.svg(m.icon)}</span><div><h4>${m.title}</h4><p>${m.description}</p><button class="secondary-btn" data-early-mission="${m.id}" ${active&&active.id!==m.id?'disabled':''}>${active?.id===m.id?'Continuar':'Empezar'} →</button></div></div>`).join('')}</div>`;
    $('#earlyContinue').onclick=()=>active?startEarlyMission(active.id):openEarlyArea(next);
    $$('[data-early-area]').forEach(b=>b.onclick=()=>openEarlyArea(b.dataset.earlyArea));
    $$('[data-early-mission]').forEach(b=>b.onclick=()=>startEarlyMission(b.dataset.earlyMission));
  }
  function renderEarlyTaskGuide(answered=false){
    let guide=$('#earlyTaskGuide');
    if(!guide){guide=document.createElement('div');guide.id='earlyTaskGuide';guide.className='early-task-guide';$('.exercise-card').prepend(guide);}
    const early=Boolean(window.ContentPolicy.forProfile(profile));guide.classList.toggle('hidden',!early);if(!early)return;
    const attempts=window.EarlyJourney.stats(state.history)[subject]?.attempts||0;
    guide.innerHTML=`<button class="mini-btn" id="earlyHomeBtn">← Mis áreas</button><span class="task-steps" aria-label="Mira, responde y sigue"><span>1 · Mira</span><span>2 · Responde</span><span class="${answered?'ready':''}">3 · Sigue</span></span><small>${attempts} actividades en esta área</small>`;
    $('#earlyHomeBtn').onclick=()=>{guidedSession=null;hideGuidedBar();switchSection('home');};
  }
  function renderHomeLevels() {
    $("#homeLevels").innerHTML = ageData()
      .subjects.map(
        (s) =>
          `<div class="level-row"><strong>${SUBJECT_META[s].name}</strong><div class="level-track"><span style="width:${((state.levels[s] || 1) / 3) * 100}%"></span></div><span class="level-tag">NIVEL ${state.levels[s] || 1}</span></div>`,
      )
      .join("");
    const stats = ageData()
      .subjects.map((s) => {
        const r = recent(s, 10);
        return {
          s,
          n: r.length,
          acc: r.length ? r.filter((x) => x.correct).length / r.length : 1,
        };
      })
      .sort((a, b) => a.acc - b.acc || b.n - a.n);
    const rec = stats[0];
    $("#recommendedTitle").textContent = rec.n
      ? `Refuerzo: ${SUBJECT_META[rec.s].name}`
      : `Empieza por ${SUBJECT_META[ageData().subjects[0]].name}`;
    $("#recommendedText").textContent = rec.n
      ? `Precisión reciente: ${Math.round(rec.acc * 100)}%.`
      : "Todavía no hay resultados suficientes.";
    $("#recommendedBtn").dataset.subject = rec.n
      ? rec.s
      : ageData().subjects[0];
  }
  $("#recommendedBtn").onclick = () => {
    guidedSession = null;
    hideGuidedBar();
    subject = $("#recommendedBtn").dataset.subject;
    switchSection("exercise");
    setupExercise();
  };
  $("#heroStartBtn").onclick = () => {
    $("#recommendedBtn").click();
  };
  function renderProgress() {
    $("#progressProfileTitle").textContent = `Evolución de ${profile.name}`;
    $("#progressCards").innerHTML = ageData()
      .subjects.map((s) => {
        const r = state.history.filter((x) => x.subject === s),
          c = r.filter((x) => x.correct).length,
          acc = r.length ? Math.round((c / r.length) * 100) : 0;
        return `<div class="progress-subject card"><small>${SUBJECT_META[s].name}</small><strong>${acc}%</strong><div class="bar"><span style="width:${acc}%"></span></div><small>${r.length} ejercicios · nivel ${state.levels[s] || 1}</small></div>`;
      })
      .join("");
    $("#recentResults").innerHTML =
      state.history
        .slice(-12)
        .reverse()
        .map(
          (x) =>
            `<div class="recent-row"><span>${SUBJECT_META[x.subject]?.name || x.subject}</span><span>${x.correct ? "✓ Correcto" : "× A revisar"}</span><strong>${x.points || 0}</strong></div>`,
        )
        .join("") || '<p class="muted">Aún no hay resultados.</p>';
    $("#bankCoverage").innerHTML =
      '<p class="muted">El catálogo se entrega desde el servidor y se amplía progresivamente. El banco completo no se descarga al dispositivo.</p>';
    $("#sessionEvolution").innerHTML =
      '<p class="muted">La evolución detallada se irá completando con nuevas sesiones.</p>';
  }
  function csvEscape(v) {
    const s = String(v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  }
  function downloadText(text, name) {
    const blob = new Blob(["\uFEFF" + text], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  $("#exportDetailCsv").onclick = () => {
    const rows = [
      [
        "usuario",
        "grupo",
        "fecha",
        "area",
        "nivel",
        "resultado",
        "puntos",
        "id",
      ],
    ];
    state.history.forEach((x) =>
      rows.push([
        profile.name,
        AGE[profile.age_band].label,
        x.ts,
        x.subject,
        x.level,
        x.correct ? "correcto" : "revisar",
        x.points,
        x.itemId,
      ]),
    );
    downloadText(
      rows.map((r) => r.map(csvEscape).join(";")).join("\n"),
      `LearningLab_${profile.name}_detalle.csv`,
    );
  };
  $("#exportSessionCsv").onclick = () =>
    downloadText(
      "usuario;grupo;ejercicios;aciertos\n" +
        [
          profile.name,
          AGE[profile.age_band].label,
          state.totalAttempts,
          state.totalCorrect,
        ]
          .map(csvEscape)
          .join(";"),
      `LearningLab_${profile.name}_resumen.csv`,
    );
  function buildHomework() {
    const options = ageData().subjects;
    $("#homeworkOptions").innerHTML = options
      .map(
        (s, i) =>
          `<label class="homework-option"><input type="checkbox" value="${s}" ${["attention", "executive", "memory", "speedReasoning", "applied"].includes(s) || i < 1 ? "checked" : ""}><span><strong>${SUBJECT_META[s].name}</strong><small>${["attention", "executive", "memory", "speedReasoning", "applied"].includes(s) ? "Ficha cognitiva funcional adaptada a la edad" : "Ficha de práctica"}</small></span></label>`,
      )
      .join("");
    $("#worksheetAll").onclick = () =>
      $$("#homeworkOptions input").forEach((x) => (x.checked = true));
    $("#worksheetNone").onclick = () =>
      $$("#homeworkOptions input").forEach((x) => (x.checked = false));
  }
  $("#generateWorksheetsBtn").onclick = async () => {
    const generateButton=$('#generateWorksheetsBtn');
    if(generateButton.disabled)return;
    const worksheetProfile = profile;
    const worksheetExportProfile = {...profile, contentLocale:API.effectiveLocale(profile)};
    const worksheetLocaleRevision = API.localeRevision;
    const selected = $$("#homeworkOptions input:checked").map((x) => x.value);
    if (!selected.length)
      return ($("#docxStatus").textContent =
        "Selecciona al menos un contenido.");
    const count = Number($("#worksheetCount").value),
      questions = Number($("#worksheetQuestions").value);
    $("#docxStatus").textContent = "Preparando fichas desde el banco seguro…";
    generateButton.disabled=true;
    try {
      const all = [];
      for (let i = 0; i < count; i++) {
        if (worksheetLocaleRevision !== API.localeRevision) throw new Error('La variante de español ha cambiado. Solicita una ficha nueva.');
        const payload={
          kind: "worksheet",
          domains: selected,
          questions,
          level: Math.max(...selected.map((s) => state.levels[s] || 1)),
        };
        const request=async()=>{
          if(worksheetLocaleRevision!==API.localeRevision || worksheetProfile!==profile)throw new Error('El perfil o la variante de español ha cambiado. Solicita una ficha nueva.');
          return requestForProfile(payload,worksheetProfile);
        };
        const res=await request();
        const valid=await window.WorksheetSelection.collect({initial:res,profile:worksheetProfile,
          country:worksheetExportProfile.contentLocale,domains:selected,count:questions,
          fetchMore:async()=>{
            $('#docxStatus').textContent=`Completando la ficha ${i+1}: buscamos actividades compatibles…`;
            return request();
          }});
        all.push(valid.items);
      }
      if (worksheetLocaleRevision !== API.localeRevision || worksheetProfile!==profile) throw new Error('El perfil o la variante de español ha cambiado. Solicita una ficha nueva.');
      await window.WorksheetGenerator.generate(all, worksheetExportProfile);
      $("#docxStatus").textContent =
        `${count} ficha${count > 1 ? "s" : ""} creada${count > 1 ? "s" : ""}.`;
    } catch (e) {
      $("#docxStatus").textContent =
        e?.message || "No se pudieron generar las fichas.";
    } finally {generateButton.disabled=false;}
  };
  function hideGuidedBar() {
    if ($("#guidedSessionBar")) $("#guidedSessionBar").classList.add("hidden");
  }
  function updateGuidedBar() {
    if (!guidedSession) {
      hideGuidedBar();
      return;
    }
    const bar = $("#guidedSessionBar");
    bar.classList.remove("hidden");
    $("#guidedSessionTitle").textContent = "Sesión guiada";
    if(guidedSession.mission)$('#guidedSessionTitle').textContent=missionDefinition().title;
    $('#cancelGuidedSession').textContent=guidedSession.mission?'Guardar y volver al inicio':'Salir de la sesión';
    $("#guidedSessionProgress").textContent =
      `Actividad ${guidedSession.index + 1} de ${guidedSession.plan.length} · ${SUBJECT_META[guidedSession.plan[guidedSession.index]].name}`;
  }
  function buildSessionBuilder() {
    const domains = [
      "attention",
      "memory",
      "executive",
      "speedReasoning",
      "applied",
    ];
    const holder = $("#sessionDomainOptions");
    if (!holder) return;
    holder.innerHTML = domains
      .map(
        (s) =>
          `<label class="session-domain"><input type="checkbox" value="${s}" ${["attention", "memory", "executive"].includes(s) ? "checked" : ""}><span><b>${SUBJECT_META[s].icon}</b><strong>${SUBJECT_META[s].name}</strong><small>${SUBJECT_META[s].desc}</small></span></label>`,
      )
      .join("");
    const update = () => {
      const n = Number($("#sessionActivityCount").value);
      const selected = $$("#sessionDomainOptions input:checked").map(
        (x) => x.value,
      );
      const plan = [];
      for (let i = 0; i < n; i++)
        if (selected.length) plan.push(selected[i % selected.length]);
      $("#sessionPlanPreview").innerHTML = plan.length
        ? `<p class="eyebrow">VISTA PREVIA</p><div class="session-plan-chips">${plan.map((d, i) => `<span>${i + 1}. ${SUBJECT_META[d].name}</span>`).join("")}</div>`
        : '<p class="muted">Selecciona al menos un área.</p>';
      $("#sessionEstimate").textContent =
        n <= 6 ? "≈ 15–20 min" : n <= 8 ? "≈ 20–30 min" : "≈ 30–40 min";
    };
    $$("#sessionDomainOptions input").forEach((x) => (x.onchange = update));
    $("#sessionActivityCount").onchange = update;
    update();
  }
  function startGuidedSession() {
    const n = Number($("#sessionActivityCount").value);
    const selected = $$("#sessionDomainOptions input:checked").map(
      (x) => x.value,
    );
    if (!selected.length) return alert("Selecciona al menos un área.");
    const plan = [];
    for (let i = 0; i < n; i++) plan.push(selected[i % selected.length]);
    guidedSession = { plan, index: 0 };
    subject = plan[0];
    switchSection("exercise");
    updateGuidedBar();
    setupExercise();
  }
  function advanceGuidedSession() {
    if (!guidedSession) return newExercise();
    if(guidedSession.mission && !guidedSession.answered)return;
    const mission=guidedSession.mission;
    guidedSession.index++;
    if (guidedSession.index >= guidedSession.plan.length) {
      const completed = guidedSession.plan.length;
      guidedSession = null;
      hideGuidedBar();
      if(mission){switchSection('home');renderEarlyHub();return;}
      switchSection("sessionBuilder");
      $("#sessionPlanPreview").innerHTML =
        `<div class="session-complete"><strong>Sesión completada</strong><span>${completed} actividades realizadas. Los resultados ya están guardados en Progreso.</span></div>`;
      return;
    }
    subject = guidedSession.plan[guidedSession.index];
    guidedSession.answered=false;
    updateGuidedBar();
    setupExercise();
  }
  if ($("#startGuidedSession"))
    $("#startGuidedSession").onclick = startGuidedSession;
  if ($("#cancelGuidedSession"))
    $("#cancelGuidedSession").onclick = () => {
      const mission=guidedSession?.mission;
      guidedSession = null;
      hideGuidedBar();
      switchSection(mission?'home':'sessionBuilder');
    };
  $("#createProfileBtn").onclick = createProfile;
  $("#newProfileBtn").onclick = openProfileGate;
  $("#profileSelect").onchange = (e) => activateProfile(e.target.value);
  $("#deleteProfileBtn").onclick = async () => {
    if (!profile || !confirm(`¿Eliminar el perfil de ${profile.name}?`)) return;
    await API.deleteProfile(profile.id);
    profiles = profiles.filter((p) => p.id !== profile.id);
    profile = null;
    if (profiles.length) activateProfile(profiles[0].id);
    else {
      renderProfiles();
      openProfileGate();
    }
  };
  $("#resetProgressBtn").onclick = () => {
    if (confirm("¿Reiniciar el progreso de este perfil?")) {
      state = blankState();
      if(profile.progress)delete profile.progress._earlyJourney;
      if(profile.progress){delete profile.progress._schoolJourney;delete profile.progress._levelCheckpoints;}
      guidedSession=null;hideGuidedBar();
      persist();
      updateGlobalUI();
    }
  };
  if ($("#subscribeBtn"))
    $("#subscribeBtn").onclick = () => API.openStripeCheckout();
  if ($("#billingPortalBtn"))
    $("#billingPortalBtn").onclick = () => API.openBillingPortal();
  $("#authSignIn").onclick = async () => {
    try {
      await API.signIn($("#authEmail").value.trim(), $("#authPassword").value);
      await loadWorkspace();
    } catch (e) {
      $("#authMessage").textContent = e.message;
    }
  };
  $("#authSignUp").onclick = async () => {
    try {
      const d = await API.signUp(
        $("#authEmail").value.trim(),
        $("#authPassword").value,
      );
      if (d.session) await loadWorkspace();
      else
        $("#authMessage").textContent =
          "Cuenta creada. Revisa tu correo para confirmar el registro.";
    } catch (e) {
      $("#authMessage").textContent = e.message;
    }
  };
  $("#signOutBtn").onclick = async () => {
    await API.signOut();
    profile = null;
    showAuth("Sesión cerrada.");
  };
  ["#authEmail", "#authPassword"].forEach((sel) =>
    $(sel).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        $("#authSignIn").click();
      }
    }),
  );
  $("#exerciseLevelSelect").onchange = async (e) => {
    if(guidedSession?.mission){guidedSession=null;hideGuidedBar();}
    state.levels[subject] = Number(e.target.value);
    if(window.AgeStages.forProfile(profile))profile.progress={...profile.progress,_levelCheckpoints:{...profile.progress?._levelCheckpoints,[subject]:{attempt:state.totalAttempts}}};
    await persist();
    counter = 0;
    newExercise();
  };
  window.addEventListener("beforeunload", () => {
    persist();
  });
  window.addEventListener('lh:locale-change', () => {
    if (!profile) return;
    if(guidedSession?.mission){guidedSession=null;hideGuidedBar();}
    ++requestGeneration;
    currentItem = null;
    for (const id of ['exerciseVisual','exerciseOptions','exerciseTopic','exerciseExplanation','exerciseFeedback','modelAnswer']) $("#"+id).textContent = '';
    $("#textAnswerArea").classList.add('hidden');
    $("#selfAssessment").classList.add('hidden');
    $("#exercisePrompt").textContent = 'La variante de español ha cambiado. Pulsa Siguiente para continuar.';
    $("#exerciseNext").classList.remove('hidden');
    setLoading(false);
  });
  boot();
})();
