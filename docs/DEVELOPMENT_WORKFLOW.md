# Flujo sencillo de Learning Hub

## Tres decisiones, sin gestionar Git manualmente

1. **Desarrollar:** Codex prepara cambios en una rama temporal `feature/*` basada en `desarrollo`.
2. **Probar:** se integra mediante PR en `desarrollo`. Cloudflare crea una preview. Se comprueban los ejercicios y el progreso.
3. **Publicar:** después de aprobarlos, se abre PR `desarrollo → main`; al fusionarla Cloudflare publica automáticamente el frontend estable desde `main`.

**Regla:** al terminar una publicación, actualizar `desarrollo` con el estado de `main`, para evitar divergencia entre las ramas. Conservar únicamente estas dos ramas permanentes; eliminar ramas temporales solo tras verificar integración y ausencia de trabajo único.

## Qué hace cada sistema

- **GitHub Actions** (`.github/workflows/publicar-beta.yml`, nombre visible *Comprobar Learning Hub*): ejecuta tests en `push` de `main` o `desarrollo`, en PR a cualquiera de ellas y manualmente. **Nunca publica** ni modifica Supabase ni otras ramas.
- **Cloudflare Pages**: proyecto `learning-hub-5n9`; rama de producción `main`, despliegues automáticos habilitados. Los despliegues de otras ramas son previews. El estado `success` de un build no sustituye probar la interfaz.
- **Supabase**: despliegues de funciones y migraciones independientes, solo cuando una modificación lo requiera y tras aprobación explícita. Antes de cualquier migración: respaldo, plan de reversión y verificación del historial remoto. No reejecutar `202610210001_billing_integrity.sql` ni `202610230001_learner_privacy.sql` por el mero hecho de no figurar en historial: sus estructuras se detectaron en producción el 15-11-2026.

## Verificación antes de publicar

1. PR sin conflictos y tests `comprobar` exitosos.
2. Probar login, un ejercicio, guardado y persistencia tras cerrar y volver a entrar.
3. Si hay cambios de backend, verificar **por separado** código desplegado y esquema.
4. Registrar el commit validado; fusionar solo con autorización.
5. Tras el despliegue, confirmar en Cloudflare **Production SUCCESS** y volver a probar login/progreso en URL principal.

## Recuperación

- Producción anterior al release del 15-11-2026: commit `b2768be`, deployment `6b086c04-2543-449f-a9f1-b38f8f686399`.
- Release funcional: `c3dcfc0`, integrado a `main` mediante PR #48, merge commit `bb39c8e`.
- Si hay incidencia, detener nuevas publicaciones y usar el mecanismo oficial de **rollback de Cloudflare Pages**, seleccionando exclusivamente el deployment anterior de *Production*, previa identificación. No confundir `Retry deployment` con `Rollback`.
- Referencia: https://developers.cloudflare.com/pages/configuration/rollbacks/
- Un rollback de Pages no revierte Supabase ni cambia Git; registrar reparación posterior si es necesaria.

## Limpieza de ramas

No borrar automáticamente las 30 ramas históricas. Conservar ramas con commits únicos y el stash `80efa35` hasta una revisión específica; solo eliminar ramas confirmadas como integradas y sin worktrees activos.

## Nota sobre el verificador antiguo

`scripts/verify-beta-web.py` permanece disponible para diagnósticos manuales; no debe utilizarse contra un alias mutable para acreditar que una publicación concreta es correcta. El workflow anterior verificaba `pruebas.learning-hub-5n9.pages.dev` y podía producir falsos fallos por código distinto del despliegue objetivo.
