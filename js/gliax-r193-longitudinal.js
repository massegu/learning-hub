(function (root) {
  'use strict';
  const schema = 'gliax.r193-observation.v1';
  const dayMs = 86400000;
  const scored = new Set(['correct', 'incorrect']);
  const statuses = new Set([...scored, 'partial', 'uninterpretable', 'pending_review', 'no_response']);
  const helpNames = ['hint', 'options'];
  const reference = /^[a-z0-9][a-z0-9 .:-]{0,79}$/i;

  function detailOf(row) {
    try {
      return typeof row?.detail === 'string' ? JSON.parse(row.detail) : row?.detail;
    } catch {
      return null;
    }
  }

  const isObservation = row => detailOf(row)?.schema === schema;

  function createDraft(item, descriptor) {
    const aids = new Set();
    let first, final, attempts = 0, elapsed = null;
    return {
      assist(kind) {
        if (helpNames.includes(kind)) aids.add(kind);
      },
      observe(status, support, responseMs, initial) {
        if (!statuses.has(status) || status === 'no_response') return;
        if (helpNames.includes(support)) aids.add(support);
        if (!attempts) {
          first = statuses.has(initial) ? initial : aids.size ? 'no_response' : status;
          elapsed = scored.has(first) && !aids.size && Number.isSafeInteger(responseMs) &&
            responseMs >= 250 && responseMs <= 120000 ? responseMs : null;
        }
        final = status;
        attempts++;
      },
      summary() {
        if (!attempts) return null;
        return {
          schema, family: item.family, mechanism: descriptor.mechanism, structure: descriptor.structure,
          ageBand: item.ageBand, level: item.level, contentVersion: item.contentVersion,
          gradingVersion: item.gradingVersion, first, final, attempts: Math.min(attempts, 999),
          aids: helpNames.filter(help => aids.has(help)), responseMs: attempts === 1 && !aids.size ? elapsed : null
        };
      }
    };
  }

  function analyze(rows, query, gradingVersion, now = Date.now()) {
    const valid = new Map();
    for (const row of rows) {
      const d = detailOf(row);
      const time = Date.parse(row.ts);
      if (!isObservation(row) || d.family !== query.family || d.ageBand !== query.ageBand ||
          d.level !== query.level || row.level !== d.level || d.gradingVersion !== gradingVersion ||
          (query.contentVersion && d.contentVersion !== query.contentVersion) ||
          !reference.test(d.mechanism) || !/^[a-f0-9]{16}$/.test(d.structure) ||
          !statuses.has(d.first) || !statuses.has(d.final) || !Number.isInteger(d.attempts) ||
          d.attempts < 1 || d.attempts > 999 || !Array.isArray(d.aids) ||
          d.aids.some(aid => !helpNames.includes(aid)) || !row.clientAttemptId ||
          !Number.isFinite(time) || time > now || now - time > 90 * dayMs) continue;
      valid.set(row.clientAttemptId, {d, time, sessionId: row.sessionId});
    }

    function metrics(values) {
      const observations = values.filter(({d}) => scored.has(d.first));
      const final = values.filter(({d}) => scored.has(d.final));
      const assisted = final.filter(({d}) => d.aids.length > 0);
      const times = observations.map(({d}) => d.responseMs)
        .filter(ms => Number.isSafeInteger(ms) && ms >= 250 && ms <= 120000).sort((a,b) => a-b);
      return {
        observations: observations.length,
        firstCorrect: observations.filter(({d}) => d.first === 'correct').length,
        finalCorrect: final.filter(({d}) => d.final === 'correct').length,
        finalScored: final.length, assisted: assisted.length,
        attempts: values.reduce((total,{d}) => total+d.attempts,0),
        sessions: new Set(observations.map(row => row.sessionId).filter(Boolean)).size,
        structures: new Set(observations.map(row => row.d.structure)).size,
        latest: values.reduce((latest,row)=>Math.max(latest ?? row.time,row.time),null),
        medianResponseMs: times.length ? (times[Math.floor((times.length-1)/2)]+times[Math.floor(times.length/2)])/2 : null
      };
    }
    const values = [...valid.values()];
    const grouped = new Map();
    for (const row of values) {
      const {mechanism} = row.d;
      if (!grouped.has(mechanism)) grouped.set(mechanism, []);
      grouped.get(mechanism).push(row);
    }
    return {family: metrics(values), mechanisms: new Map([...grouped].map(([key, rows]) => [key, metrics(rows)]))};
  }

  function recommend(metrics, level) {
    const {observations, sessions, structures, firstCorrect, assisted} = metrics;
    if (observations < 8 || sessions < 3 || structures < 3) return {level, reason:'insufficient', observations};
    if (level < 3 && firstCorrect / observations >= 0.8 && assisted / observations <= 0.25) {
      return {level:level+1, reason:'supervised-step', observations};
    }
    if (firstCorrect / observations <= 0.55) return {level, reason:'reinforce', observations};
    return {level, reason:'maintain', observations};
  }

  function weight(metrics) {
    if (!metrics || metrics.observations < 4 || metrics.sessions < 2 || metrics.structures < 2) return 1;
    return 0.88 + 0.37 * (1 - metrics.firstCorrect / metrics.observations);
  }

  const stagingOrigin = 'https://gliax-staging.pages.dev';
  const stagingApi = 'https://wejcfaralctolzxjbcil.supabase.co';
  const hosted = (config, location) => config?.staging === true && config.supabaseUrl === stagingApi &&
    location?.origin === stagingOrigin;
  let hostedActive = false, controlRequest;

  function enabled(config = root.LH_CONFIG, location = root.location) {
    const local = host => ['localhost', '127.0.0.1', '[::1]'].includes(host);
    if (config?.r193Longitudinal !== true) return false;
    if (hosted(config, location)) return hostedActive;
    if (!local(location?.hostname)) return false;
    try { return local(new URL(config.supabaseUrl).hostname); } catch { return false; }
  }
  function refresh(config = root.LH_CONFIG, location = root.location, fetchControl = root.fetch) {
    if (config?.r193Longitudinal !== true || !hosted(config, location)) return Promise.resolve(enabled(config, location));
    if (!controlRequest) {
      hostedActive = false;
      controlRequest = Promise.resolve().then(async () => {
        const response = await fetchControl('/r193-longitudinal.json', {
          cache:'no-store', redirect:'error', credentials:'omit', signal:AbortSignal.timeout(2000)
        });
        hostedActive = response.ok && (await response.json())?.enabled === true;
        return hostedActive;
      }).catch(() => false).finally(() => { controlRequest = null; });
    }
    return controlRequest;
  }
  const api = {schema, isObservation, createDraft, analyze, recommend, weight, enabled, refresh};
  root.GliaxR193Longitudinal = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
