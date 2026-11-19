# GLIAX Staging · Word bajo la CSP de Pages

`tools/staging/build_cloudflare.py` copia la distribución UMD para navegador de DOCX 8.5.0 a `/js/vendor/docx-8.5.0/index.umd.js` junto con la licencia MIT original. La copia de `js/docx.js` del artefacto apunta a ese archivo. El código fuente del cargador conserva el comportamiento de las otras compilaciones de GLIAX.

## Origen e integridad

- Distribución oficial de npm, [docx 8.5.0](https://registry.npmjs.org/docx/-/docx-8.5.0.tgz), registrada en `package-lock.json` con SRI `sha512-4SbcbedPXTciySXiSnNNLuJXpvxFe5nqivbiEHXyL8P/w0wx2uW7YXNjnYgjW0e2e6vy+L/tMISU/oAiXCl57Q==`.
- El paquete descargado coincidió con el SRI. Las huellas SHA-256 del UMD y de la licencia extraídos del paquete coincidieron con las de la instalación fijada.
- UMD `02d568d203c0180af37609bcf5ff6c0919d220f933a88ca896eba0556a08faad`. Licencia `b5b2364c0c95a26b2a2399d7e706a61acac680be1d5b180b00592ee85830bffb`.
- El UMD publica `window.docx`. Se distribuye sin transformar y no necesita cargar módulos adicionales de red. Se verificó al generar los documentos bajo la CSP final.

## Construcción y dependencias

La compilación de Pages debe ejecutar `npm ci --ignore-scripts --include=dev && python3 tools/staging/build_cloudflare.py`. DOCX ya está fijado como dependencia de desarrollo y el constructor comprueba ambos archivos antes de publicar `dist-gliax-staging`. Para el ensayo local se usan los valores de ref y origen que exige el constructor, con una clave publicable ficticia. La publicación futura debe reconstruir el artefacto con la clave publicable del proyecto autorizado y registrar su propia huella.

| Recurso | Carga y comprobación |
| --- | --- |
| Supabase JS `@2` | jsDelivr en `index.html`. La copia de ensayo resolvió a 2.119.2 y ejecutó el flujo de Auth y REST simulado. El alias `@2` puede resolver otra versión en una visita futura. |
| JSZip `3.10.1` | jsDelivr. Cargado desde la URL configurada por el generador y utilizado para ZIP y XLSX. |
| ExcelJS `4.4.0` | jsDelivr en rutas heredadas. El panel vigente construye XLSX con JSZip. La prueba carga también ExcelJS desde su URL heredada bajo la misma CSP y abre el XLSX exportado. |
| DOCX `8.5.0` | Mismo origen en Pages Staging. Genera la ficha y el solucionario sin conectividad a unpkg. |
| CSV y estímulos | El CSV se genera en el navegador. Los estímulos de la aplicación se sirven con el artefacto. |

La política emitida por el constructor permanece igual en la cabecera HTTP y en la etiqueta de los documentos HTML.

```text
default-src 'self'; connect-src 'self' https://wejcfaralctolzxjbcil.supabase.co; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'self'
```

`_headers` emite también `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y `X-Robots-Tag: noindex, nofollow`.

## Repetir el ensayo local

Guardar las distribuciones de las tres URL de jsDelivr del test en un directorio de prueba con los nombres `supabase.js`, `jszip.min.js` y `exceljs.min.js`. Ejecutar `python3 tests/browser-staging-exports.py DIST DEPENDENCIAS MUESTRAS`. El servidor sirve los archivos de `DIST` y aplica la cabecera HTTP real generada en `_headers`. Playwright entrega esa respuesta al navegador bajo el origen canónico, reproduce las bibliotecas desde copias locales y recoge infracciones CSP y peticiones inesperadas. La prueba usa el SDK de Supabase real con datos HTTP ficticios y el generador Edge local. Verifica la descarga DOCX en modo rápido, las cantidades y el solucionario en Ficha a la carta, ZIP, CSV y XLSX.

En Staging quedan por verificar la entrega real de cabeceras y caché en Pages, la configuración de Auth y acceso del proyecto, el runtime de Edge, los permisos SQL y la conectividad real a jsDelivr. La apertura en Microsoft Word queda para una comprobación en ese programa.
